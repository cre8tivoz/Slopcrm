# Development note

Working record for this repo: what it is, what the audit intended, what has been done, what was discovered along the way, and what is unfixable for now. Maintained alongside the code — update it when a pass lands.

## What this is

A sales CRM prototype built on the Kargul Starter foundation (Next.js 16, React 19, Tailwind CSS 4, TypeScript, Zustand, Motion). All data is static and client-side (`data/companies.ts` + Zustand store) — there is no backend, auth, or persistence. The product surface is the Companies view: header tabs, filters, table/card list, company detail sheet, owner profile sheet, new-company dialog and ⌘K command menu.

## Audit intent

Onboarding review (October 2026) targeted four axes:

1. **Security** — dependency vulnerabilities, secret hygiene.
2. **Usability & journeys** — mobile as the primary driver, desktop fully featured; honest controls; keyboard and touch access.
3. **Design & animation** — build on the repo's existing motion system (GSAP power easings in `app/globals.css`, `tw-animate-css`, Motion primitives) rather than inventing a new one.
4. **Speed** — measure before trimming; the dependency surface (Rive, Lottie, Swiper, PhotoSwipe) is larger than the current feature set requires.

## Done

### Security dependency sweep (PR #1, squash `3677bc3`)

- `npm audit`: 20 → 5 vulnerabilities. Both criticals cleared — `next` 16.3.0 → 16.3.8 (RCE advisories) and `swiper` 12.0.3 → 12.2.0 (prototype pollution). Transitive fixes covered sharp, svgo, js-yaml, browserslist and the Babel chain.
- Secret scan: no keys in the tracked tree, no `.env` committed.
- Remaining 5 highs are one dev-only chain — see "Unfixable for now" below.

### Mobile-first usability & design pass (PR #1, squash `3677bc3`)

- **Responsive shells.** Below 1024px the app renders a card list (`components/companies/table/company-card.tsx`) instead of the horizontally scrolling 9-column table; at ≥1024px the full table and sidebar are unchanged. The split aligns with the sidebar breakpoint so there is one consistent "touch shell" and one "desktop shell".
- **Touch targets.** New `fine:` custom variant (`@media (pointer: fine)`) lets controls be 44px on coarse pointers while keeping the compact 30px desktop density. A `tap-target` utility (globals.css) expands small icon controls via a pseudo-element hit area. Applied across header, toolbars, sheet/dialog footers, inputs, selects and sidebar nav.
- **Keyboard & accessibility.** Table rows are focusable with Enter/Space activation; focus-visible outlines verified by pixel inspection; empty state offers a **Clear filters** recovery action; the Deals/Forecast tabs are honestly disabled (`title="Coming soon"`) instead of silently doing nothing.
- **Contrast.** Token fixes for WCAG AA: `--muted-foreground` / `--sidebar-foreground` #7f7f7f → #8a8a8a (4.5 → 5.2 on card surfaces), `--subtle` #676767 → #8f8f8f (3.2 → 5.6 — column headers and tab labels were failing).
- **Motion.** Press `scale(0.96)` on all buttons; staggered `rise` entrance on table rows and cards (power2-out, capped at 12 × 18ms); sheet-section stagger via the `stagger-children` utility; checkbox icon crossfade; `SlidingNumber` (previously shipped unused) wired to the "Companies in view" count with `MotionConfig reducedMotion="user"`.
- **Reduced motion.** Global `prefers-reduced-motion` guard in `app/globals.css` short-circuits animations, transitions and smooth scrolling.
- Minor: "Avg win probality" typo, header fits 320px without overflow.

### Speed & bundle pass (PR #2)

- **Method:** initial JS = script tags in the prerendered HTML, gzipped; live numbers from Resource Timing against `next start`. Baseline: **310.2 KB gz / 9 chunks** initial, ~320 KB transferred / 11 requests at runtime.
- **Key baseline finding:** the Rive and Lottie _runtimes_ were already lazily split by their own packages and never downloaded at load — the popular "drop the heavy deps" win did not exist. The bundle floor is react-dom + next + Motion + Radix + app code.
- **Changes:**
  - Interaction-only panels — ⌘K command menu (pulls `cmdk`), New Company dialog, Profile sheet — code-split with `next/dynamic` and mounted on first open (`useEver` flag stays true afterwards so exit animations keep playing). The global ⌘K listener moved to `companies.tsx` so the shortcut works before the menu has ever loaded.
  - Rive/Lottie component wrappers moved out of the shared chunk (`asset.tsx` dynamic imports; dead `AssetRive`/`AssetLottie` barrel re-exports removed — zero consumers). The files and the `type="rive"|"lottie"` capability remain; nothing in the CRM renders them today.
  - Dead dependencies removed: `swiper` (zero source imports, 3.6 MB unpacked — and ironically the security sweep's upgrade target) and `cn` (zero imports, 374 KB).
- **Result:** initial JS **310.2 → 297.8 KB gz**; deferred chunks (~cmdk + panels) fetch on first open. The company detail sheet — the primary journey — stays eager on purpose.
- **Verified:** lint ✓, build ✓, prod QA — cold Ctrl+K opens focused, close/reopen cycle, New Company + Profile open/close, row → detail instant, mobile 390px (18 cards, no overflow), no heavy markers in initial chunks.
- **Left alone deliberately:** react/next/Motion/Radix core, the 38.5 KB polyfill chunk (only loaded by legacy browsers — modern clients skip it), CSS (13.7 KB gz) and the single font (29.6 KB) — all already lean.

### Missing screens wired up (PR #4)

- **View router** (`components/shell.tsx`): the app header, global panels (detail sheet, profile, new-company, ⌘K menu) and view switch now live in a shell that renders on `activeTab` — the store field the header tabs always had but nothing consumed. Each view swap replays the `rise` entrance.
- **Deals Board** (`components/deals/`): kanban columns by primary stage (7 stages + Unstaged, empty columns get an honest state), summary strip (total/weighted/open deals), cards → company detail sheet. Horizontal scroll-snap board on mobile.
- **Forecast** (`components/forecast/`): KPIs (total pipeline, weighted, avg win %, open deals), pipeline-by-stage bars, top-8 opportunities (→ detail), forecast-by-owner (→ profile).
- **Activities** (`components/activities/`): date-sorted interaction feed from `lastInteraction`, KPI strip, rows → detail.
- **Navigation**: sidebar Companies/Deals Board/Forecast/Activities wired with active state (mobile nav sheet closes on navigate); header Deals/Forecast tabs enabled (no more "Coming soon"); header title follows the view; the "Active" pill only shows on Companies where it means something. Remaining sidebar items (Contacts, Email Sequences, Team, Reporting, Pipelines…) stay decorative — no data exists for them, so no fake screens.
- **One stage rule**: shared `primaryStage()` in `lib/companies.ts` — every company counts in exactly one stage, so board columns, forecast stage rows and the KPI totals reconcile to the dollar (verified: stage rows sum to `$5,138,594` = Total pipeline KPI, weighted to `$2,681,163` across all three views).

### Module pass — S1: domain core + tests (Matt Pocock Phase 9)

Architecture review found the domain rules smeared across views and already drifting. S1 pulls them into small, deep, tested modules (glossary in `CONTEXT.md`):

- **`lib/pipeline.ts`**: `summarise`, `byStage`, `byOwner`, `topByWeighted`, `primaryStage`, `weightedValue`, `stageTone`. Deals Board, Forecast and Owner Profile all read from it; 8 inline `reduce`s are gone. Fixes Forecast "Top opportunities" still using the old global stage rule (Spotify showed Expansion there, Land & Expand on the board).
- **Recency has one source of truth.** The seed data stored `activityDays` _and_ `lastInteraction.date`, and they disagreed for all 18 companies (LVMH counted as 88 days old but showed a date 205 days back; HubSpot's last touch was in the future). `activityDays` is gone; seed records now date the last touch as days before **`DEMO_TODAY`** (`lib/demo-clock.ts`), keeping the old values, so the Last-activity filter gives 2 / 5 / 9 / 18 companies at 7 / 30 / 60 / 90 days and matches the dates on screen.
- **Seeded interaction log** (`data/interactions.ts`): deterministic history per company (seeded PRNG, no `Math.random`, so the prerender and the browser agree). Each company's newest entry _is_ its Last Interaction. It drives:
  - **Activities**: now a real timeline grouped by day (last 90 days), with KPIs for touches in 7 and 30 days, accounts touched and the most frequent touch type.
  - **Detail sheet → Activity trend**: email / meeting / call / note counts come from the log, and the Last 7/30/90 picker now actually changes them (it was decorative). The made-up `companyActivity()` multipliers are gone.
  - **New Company** logs its first touch, so a new company appears in Activities straight away.
- **Why a fixed demo clock, not `new Date()`:** the page is prerendered at build time, so a moving clock would render different dates on the server and the client (a hydration mismatch). To re-date the whole demo, change one line.
- **Tests:** Vitest (node env), 32 tests across the pipeline, demo clock, filters, interaction log, activity selectors and CSV escaping (including the formula-injection guard). Added to CI as `npm test`. `@types/node` bumped 20 → 24 to match the CI runtime (Vitest 5 requires ≥22).
- **Honest numbers:** the sidebar Companies count is the real count (it was `223 +` a fake base); the hard-coded Forecast badge `9` is gone.

### Module pass — S2: UI atoms + view registry

- **`components/company/company-logo.tsx`**: one logo tile (logo, or the name's initial) with six sizes (`2xs`–`xl`). It replaces **7 hand-copied tiles** (card, table/command row, detail header, profile row, deal card, Activities row, notification badge). Two of those copies had a broken class (`1px#232323`, missing `_`), so their outline never rendered on deal cards; it does now.
- **`components/company/company-tag-list.tsx`**: the trimmed tag list with a "+N" chip, replacing 3 copies of the `splitTags` + `Tag` loop. It renders tags only, so each surface keeps its own wrapper.
- **`lib/views.ts`**: the one place a view is declared (id, page title, nav label, header tab). The header tabs, page title, sidebar and the shell's view switch all read from it. Components and nav icons are mapped with `Record<ViewId, …>`, so **adding a view without wiring it is a type error**. `activeTab` is now `ViewId`, not `string`. Tabs guard unknown values with `isViewId`.
- **Deliberately not built:** `OwnerChip` and `StageTag`. Owner display varies too much between surfaces, and the stage tag is already a one-liner (`<Tag tone={stageTone(stage)}>`). Wrapping either would add interface without hiding anything ("depth over shallowness").

### Module pass — S3: state

- **Store split by reason to change.** `stores/companies-store.ts` now holds only business data: companies, the interaction log, notification read state and `addCompany`. It's the part a real backend would replace. The new **`stores/ui-store.ts`** holds what the interface is doing: current view, open panels, filters and row selection. The old store mixed both in 31 members.
- **Filters are one object.** `filters: CompanyFilters` with one `setFilter(key, value)` and `resetFilters()` replaces four fields and four setters. Before, those were read separately and re-assembled in three components, each re-running the filter.
- **`hooks/use-visible-companies.ts`** is the single "what the table shows" answer, used by the table, the mobile filter sheet's "Show N" button and the CSV export. What you export is, by definition, what you see.
- **`navigate(view)`** replaces `setActiveTab`, and it also closes the mobile nav, so callers can't forget to.
- **Bug fixed:** Owner Profile → "Filter table by owner" used to set a filter on the Companies table even when you were on Deals or Forecast, so nothing visibly happened. It now navigates to Companies too.
- `activeTab` is renamed `activeView`. The New Company dialog closes itself after `addCompany` (data no longer reaches into UI state).
- 8 store tests (sheet exclusivity, filter set and reset, selection, the new company's first touch, notification reads). **44 tests total.**

### Module pass — S4: leftovers removed, kit capabilities labelled

- **Deleted, 5 true leftovers** (no references in code, config or docs): `components/_common/header.tsx` (empty file), `stores/example-store.ts`, `data/socials.ts`, `hooks/use-mobile-breakpoints.ts`, `components/_ui/lazy-lottie.tsx` (superseded by `Asset`'s Lottie branch).
- **Moved to `kit/`, not deleted.** The architecture review first called these dead, but `CLAUDE.md` documents them as starter-kit capabilities. Billy chose to keep them, clearly labelled: `kit/asset/` (the whole `Asset` family, including `video.tsx`), `kit/lightbox/`, `kit/inline-asset.ts`, `kit/easings.ts`. All are moved with `git mv`, contents unchanged except one import path. The CRM imports only `Asset` (images) from `@/kit/asset`. `kit/README.md` explains what each piece is and whether the CRM uses it.
- **Left in `scripts/`:** the AVIF and Rive-frame tooling. `rive-frame.mjs` hard-codes its own `/scripts/` URL and couldn't be exercised here, so it wasn't moved.
- **Bundle:** initial JS **301.2 KB gz**, up 3.4 KB from 297.8 after PR #2. That growth landed somewhere in S1–S3, which weren't measured individually. No Rive, Lottie or PhotoSwipe runtime appears in initial chunks.

### S5: honest sparklines, naming, static hosting

- **Activity sparklines are real now.** Each one was drawn from four hand-made patterns (`TREND_A`–`D`), and the alternating colours came from a fixed decorative pattern, so the table showed an invented chart beside real counts. Now `lib/activity.weeklyTouches()` counts touches per week for the last 14 weeks from the same interaction log as the Activities feed and detail sheet. The row, card and detail sheet all draw it, and a newly created company shows its first touch. The scale is fixed (1/2/3+ touches → 6/10/14 px), not per company, so rows compare honestly. Quiet weeks are a muted stub. The `trend` field is gone from `Company`. Each sparkline now has an accessible label ("7 touches in the last 14 weeks") instead of being hidden from screen readers.
- **Sidebar Contacts no longer shows a fake "38".** There's no contacts data, so it shows no count.
- **Naming:** README rewritten for what this actually is, `package.json` renamed to `slopcrm`.
- **Static hosting, opt-in.** `npm run build:static` (`STATIC_EXPORT=1`) writes plain files to `out/`. `NEXT_PUBLIC_BASE_PATH` mounts the app in a subfolder. Without either, `npm run build` and `next start` behave exactly as before.
  - Hard-coded `public/` image paths in `data/` go through `lib/base-path.withBasePath()`. Next prefixes its own routes and `_next` assets, but not plain `src` strings, so every logo and avatar 404'd in a subfolder before this.
  - `absoluteUrl()` keeps a path in `SITE_URL` (it used to drop `/slopcrm`, so canonical, OG and sitemap URLs pointed at the domain root).
  - `robots.txt` stays per-request on a server (the canonical-host check is unchanged). In a static export it can't see the host, so it always disallows indexing.
  - CI also runs the static export with a base path, so a server-only API can't sneak back in unnoticed.
- **Verified:** lint, **50 tests**, normal build (robots still dynamic) and static export. The export was served from a `/slopcrm/` subfolder: 18 rows, all 55 images load from `/slopcrm/assets/…`, sparklines labelled with real counts, no console errors, vision check clean.

### Reporting screens

- **Domain module `lib/reporting.ts` (tested, +7 tests, 57 total):**
  - `getStageConversionFunnel()`: ordered lifecycle progression from New Logo to Renewal, deal counts, pipeline share %, win probability %, yield ($ weighted) and at-risk value ($ unweighted − weighted).
  - `getPipelineVelocity()`: 14-week touch volume with 4-week rolling moving average, deal health classification (`active` ≤ 14d, `at-risk` 15–45d, `slipping` > 45d), and dormancy rankings.
  - `getRepPerformance()`: owner scorecard aggregating managed accounts, deals, pipeline, weighted forecast, win rate, 30d/90d touch volume, and activity-per-deal ratios; ranks by weighted pipeline.
- **Reporting view `components/reports/`:**
  - Executive KPI ribbon: Pipeline Win Rate (51%), Total Pipeline ($5.14M / $2.68M wtd), 4-Wk Touch Pace (3.8/wk), Deals Needing Attention (15).
  - Sub-navigation tabs: Overview, Conversion & Funnel, Pipeline Velocity, Rep Performance.
  - Interactive cross-linking: clicking any account chip opens `openDetail(company.id)`; clicking any rep row opens `openProfile(rep.owner.name)`.
  - Wired into `lib/views.ts` (Header Tabs) and `sidebar-content.tsx` (primary nav + "Q1 Forecast" and "Slipping Deals" shortcuts).
- **Verified:** 57 tests passing, lint clean, `npm run build` and `npm run build:static` clean, desktop (1440/1280) and mobile (390) browser QA and vision QA clean.

## Discovered while working

- **`CONVENTIONS.md` and `OPTIMIZATION.md` are missing.** `CLAUDE.md` includes `@CONVENTIONS.md` and the README's docs table lists both. Agents following those pointers currently fail. Either restore the files or update the references.
- **README/`package.json` said "Kargul Starter"** while the browser metadata says "Sales CRM". **Fixed in S5.**
- **`SlidingNumber` shipped unused** — a complete Motion primitive with no consumer until this pass. It now drives the footer count.
- **Test suite is unit-level only.** Vitest covers the pure domain modules (`lib/`, `data/`); there are no component or browser tests. Journeys are verified by hand/headless QA on each PR.
- **`selectedIds` has no bulk-action consumer.** Row checkboxes drive visual selection only; nothing acts on a selection. Either a bulk toolbar is planned or the selection UI is dead weight.
- **Headless QA caveat:** in automation the browser is frame-starved — CSS animations freeze at `currentTime: 0` and ResizeObserver callbacks don't fire until a frame is forced (e.g. a screenshot). Radix sheets appear stuck "closing" and animated counters appear blank; this is environmental, not a product bug. Force a frame before judging animation state. `pointer: fine` also never matches headless, and Radix `DropdownMenu` **and Radix `TabsTrigger`** open/activate on `pointerdown` (real pointer-event sequences, not synthetic `.click()` or `.focus()`).
- **Build emits a deprecation warning** (`module.register()` → `module.registerHooks()`) from Next.js internals — upstream, not ours.
- **`next dev` and `next build` share `.next/`.** Running a production build while the dev server is up interleaves writes — measurements (and the dev server itself) get flaky. Stop the dev server before building. Related: an orphaned `next-server` process can hold port 3000 after its wrapper is killed; find it via `ss -ltnp`.
- **The lightbox, Rive/Lottie/video, image inlining and Motion easings have no CRM consumers, but they aren't dead code.** `CLAUDE.md` documents them as starter-kit capabilities. Since S4 they live in `kit/` (see `kit/README.md`), which is why `photoswipe`, `@rive-app/*` and `lottie-react` stay in `package.json`. None of them ship in the initial bundle (verified: no runtime fingerprints in initial chunks).

## Unfixable for now

- **5 high vulnerabilities, all one dev-only chain:** `braces` → `micromatch` → `fast-glob` → `@next/eslint-plugin-next` → `eslint-config-next`. Root cause is `braces` ≤ 3.0.3 (GHSA-vfj7-8cjw-p6xm, stack exhaustion via deeply nested patterns) and **3.0.3 is the latest published release with no patched version upstream**. `npm audit` offers only "fix" is `npm audit fix --force`, which downgrades `eslint-config-next` to 14.2.35 — that breaks Next 16 linting and does not even remove `braces`. Not taken. Risk is low: build-time tooling only, never in the production bundle, and the attack requires an attacker to supply malicious glob patterns to your own linter. **Re-sweep when `braces` publishes a patched release** (`npm view braces versions`).
- **Vision-based visual QA was unavailable** during the design pass (the configured model was rejected by the provider) — that pass was verified through DOM measurements, computed styles and pixel statistics rather than model-read screenshots. **Fixed 2026-10-07:** the vision auxiliary model is now `openai-codex` + `gpt-5.6-luna`, verified live; screenshot QA works.
- **Selection bulk actions** can't be "fixed" without a product decision: build a bulk toolbar or remove selection. Out of scope for a polish pass.

## Next moves (from the original audit, not yet actioned)

- ~~Reconcile README/docs/naming with the actual product.~~ Done in S5, apart from the missing `CONVENTIONS.md`/`OPTIMIZATION.md`.
- Deeper UX: pagination/virtualisation if company counts grow, loading/empty states beyond the filters case, and Contacts/Email Sequences if real data ever arrives.
