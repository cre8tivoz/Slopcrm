# kit/ — starter-kit capabilities

Slopcrm grew out of the **Kargul Starter** kit. These modules are kit
capabilities that `CLAUDE.md` documents for every build. They're kept intact
and working, and moved out of the CRM's own folders so it's clear what the app
uses and what is toolkit.

| Module            | What it does                                                                                                                                                                                                                    | Used by the CRM?                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `asset/`          | `Asset`: the one media component (`type="image" \| "video" \| "rive" \| "lottie"`), with `width`/`height` as the aspect ratio. Rive and Lottie runtimes load lazily, so they cost nothing until rendered. Includes `video.tsx`. | **Yes, images only** (`CompanyLogo`, `Avatar`, logo upload). Video, Rive and Lottie are unused. |
| `lightbox/`       | `LightboxGallery` / `LightboxImage` (PhotoSwipe), behind the `[[lightbox-image]]` Figma directive.                                                                                                                              | No                                                                                              |
| `inline-asset.ts` | `inlineAsset(path)`: inlines a small `public/` image as a data URI at build time, so the first screen paints without a request (navbar/hero rule). Server-only (`node:fs`).                                                     | No                                                                                              |
| `easings.ts`      | The GSAP-style power easings as cubic-bézier tuples for Motion. The same curves exist as Tailwind `ease-power*` utilities in `app/globals.css`, which the CRM _does_ use.                                                       | No (CSS twins are used)                                                                         |

Kit asset tooling stays in `scripts/` (`npm run to:avif`, `extract:avif`,
`frame:rive`), as documented in the README.

## Rules

- App code imports kit modules by path (`@/kit/asset`); kit modules never import app code.
- Unused here ≠ dead. Remove a kit module only if this fork stops following the
  kit's `CLAUDE.md` conventions, and update `CLAUDE.md` in the same change.
- The runtime packages these need (`@rive-app/*`, `lottie-react`, `photoswipe`)
  stay in `package.json` so the kit type-checks and builds. Unrendered kit code
  is code-split or never imported by a route, so it adds no bytes to the CRM's
  initial load.
