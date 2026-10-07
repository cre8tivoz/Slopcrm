# Slopcrm

A mobile-first sales CRM demo: companies, a deals board, a forecast and an activity timeline, running on realistic, internally consistent sample data. Built with Next.js 16, React 19, Tailwind CSS 4, Zustand and Motion, on top of the **Kargul Starter** kit.

It's a front-end demo. There's no backend; the data is seeded in `data/` and lives in the browser, so anything you add resets on reload.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Script                 | What it does                                                         |
| ---------------------- | -------------------------------------------------------------------- |
| `npm run dev`          | Start the dev server                                                 |
| `npm run build`        | Production build (serve with `npm run start`)                        |
| `npm run build:static` | Static export to `out/` for any web host, no Node needed (see below) |
| `npm run start`        | Serve the production build                                           |
| `npm run lint`         | ESLint                                                               |
| `npm test`             | Vitest unit tests                                                    |
| `npm run to:avif`      | Convert an image to AVIF and report its inline cost                  |
| `npm run extract:avif` | Pull the first frame of every `.webm` under `public/` as a poster    |
| `npm run frame:rive`   | Render a still from a `.riv` file for use as its poster              |

## Static hosting

Because there's no backend, the whole app exports as plain files:

```bash
NEXT_PUBLIC_BASE_PATH=/slopcrm \
NEXT_PUBLIC_SITE_URL=https://example.com/slopcrm \
npm run build:static
```

Upload the contents of `out/` to the matching folder on the host. Leave `NEXT_PUBLIC_BASE_PATH` unset when serving from a domain root. A static export's `robots.txt` always disallows indexing, because it can't see which host it's on.

## How it's put together

- **Domain logic** lives in small, tested modules in `lib/`: `pipeline` (money and stage maths), `activity` (touch counts, weekly trend, timeline grouping) and `demo-clock` (the fixed "today" the sample data is dated against).
- **State** is split by reason to change: `stores/companies-store` holds the business data a real backend would replace; `stores/ui-store` holds what the interface is doing (view, panels, filters, selection).
- **Views** are registered once in `lib/views.ts`. Adding a view without wiring it is a type error.
- **`kit/`** holds starter-kit capabilities the CRM doesn't currently use (see `kit/README.md`).

## Docs

| File             | What's in it                                                            |
| ---------------- | ----------------------------------------------------------------------- |
| `CONTEXT.md`     | Domain glossary: what a stage, touch, pipeline value etc. mean here     |
| `DEVELOPMENT.md` | What's been changed in this fork, what was found, and what's still open |
| `kit/README.md`  | The starter-kit modules and whether the CRM uses them                   |
| `AGENTS.md`      | Next.js version notes for agents                                        |
| `CLAUDE.md`      | Agent entry point for the kit's build conventions                       |

`CLAUDE.md` points at a `CONVENTIONS.md` (and the kit referenced an `OPTIMIZATION.md`). Neither file shipped with the original repo.
