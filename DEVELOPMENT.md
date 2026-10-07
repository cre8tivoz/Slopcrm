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

## Discovered while working

- **`CONVENTIONS.md` and `OPTIMIZATION.md` are missing.** `CLAUDE.md` includes `@CONVENTIONS.md` and the README's docs table lists both. Agents following those pointers currently fail. Either restore the files or update the references.
- **README/`package.json` still say "Kargul Starter"** (`name: kargul-starter`) while the browser metadata says "Sales CRM". Naming is unreconciled.
- **`SlidingNumber` shipped unused** — a complete Motion primitive with no consumer until this pass. It now drives the footer count.
- **Test suite is unit-level only.** Vitest covers the pure domain modules (`lib/`, `data/`); there are no component or browser tests. Journeys are verified by hand/headless QA on each PR.
- **`selectedIds` has no bulk-action consumer.** Row checkboxes drive visual selection only; nothing acts on a selection. Either a bulk toolbar is planned or the selection UI is dead weight.
- **Headless QA caveat:** in automation the browser is frame-starved — CSS animations freeze at `currentTime: 0` and ResizeObserver callbacks don't fire until a frame is forced (e.g. a screenshot). Radix sheets appear stuck "closing" and animated counters appear blank; this is environmental, not a product bug. Force a frame before judging animation state. `pointer: fine` also never matches headless, and Radix `DropdownMenu` **and Radix `TabsTrigger`** open/activate on `pointerdown` (real pointer-event sequences, not synthetic `.click()` or `.focus()`).
- **Build emits a deprecation warning** (`module.register()` → `module.registerHooks()`) from Next.js internals — upstream, not ours.
- **`next dev` and `next build` share `.next/`.** Running a production build while the dev server is up interleaves writes — measurements (and the dev server itself) get flaky. Stop the dev server before building. Related: an orphaned `next-server` process can hold port 3000 after its wrapper is killed; find it via `ss -ltnp`.
- **`components/_ui/lightbox/` has no consumers** but is still type-checked, which is why `photoswipe` cannot be dropped from `package.json` without touching those files. It ships zero bytes today.

## Unfixable for now

- **5 high vulnerabilities, all one dev-only chain:** `braces` → `micromatch` → `fast-glob` → `@next/eslint-plugin-next` → `eslint-config-next`. Root cause is `braces` ≤ 3.0.3 (GHSA-vfj7-8cjw-p6xm, stack exhaustion via deeply nested patterns) and **3.0.3 is the latest published release with no patched version upstream**. `npm audit` offers only "fix" is `npm audit fix --force`, which downgrades `eslint-config-next` to 14.2.35 — that breaks Next 16 linting and does not even remove `braces`. Not taken. Risk is low: build-time tooling only, never in the production bundle, and the attack requires an attacker to supply malicious glob patterns to your own linter. **Re-sweep when `braces` publishes a patched release** (`npm view braces versions`).
- **Vision-based visual QA was unavailable** during the design pass (the configured model was rejected by the provider) — that pass was verified through DOM measurements, computed styles and pixel statistics rather than model-read screenshots. **Fixed 2026-10-07:** the vision auxiliary model is now `openai-codex` + `gpt-5.6-luna`, verified live; screenshot QA works.
- **Selection bulk actions** can't be "fixed" without a product decision: build a bulk toolbar or remove selection. Out of scope for a polish pass.

## Next moves (from the original audit, not yet actioned)

- Reconcile README/docs/naming with the actual product.
- Deeper UX: pagination/virtualisation if company counts grow, loading/empty states beyond the filters case, and Contacts/Email Sequences if real data ever arrives.
