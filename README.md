# Slopcrm

A mobile-first sales CRM demo: companies, a deals board, a forecast and an activity timeline, running on realistic, internally consistent sample data. Built with Next.js 16, React 19, Tailwind CSS 4, Zustand and Motion, on top of the **Kargul Starter** kit.

It's a front-end demo. There's no backend: the data is seeded in `data/`, and anything you change saves in your browser (`localStorage`). **Reset demo data** at the bottom of the menu puts the seed back.

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

## VentraIP auto-deployment

The GitHub workflow in `.github/workflows/ci.yml` deploys changes pushed to `main` to **https://witchdaddylabs.com/slopcrm/** after lint, application tests, deployment-boundary tests, the normal build and the subfolder static export pass. Pull requests run the checks but never deploy or receive FTP credentials. The workflow can also be run manually on `main` from Actions.

The deploy job downloads the exact export tested by the gate; it does not rebuild it. Main deployments queue rather than cancelling an upload in progress. `scripts/deploy_ftp.py` uses certificate-verified FTPS, writes only under `/slopcrm/` in the existing WDL FTP account's locked website root, uploads assets before pages and verifies every public file against the served HTTPS bytes. It never deletes remote files or writes the main WDL homepage. The existing `/slopcrm` folder must be visible to that FTP account; a missing folder is an error, not a reason to guess another path.

**One-time credential prerequisite:** add the existing WDL FTP login as these **Slopcrm repository Actions secrets**, using the same values already configured in `cre8tivoz/WDLsite`:

- `WDL_FTP_HOST`
- `WDL_FTP_USER`
- `WDL_FTP_PASS`

GitHub does not automatically share repository secrets between these two personal-account repositories. Secret names being present is not proof that the login works: activation is verified only after a real deployment and live check. Do not print the password, store it in repository files, reset it, or expose FTP secrets to a pull-request job.

The successful release publishes `/slopcrm/deployment.json` with the source commit and built file hashes. Check it against the Actions run SHA, then render the app at desktop and mobile widths: working images, clean console, no horizontal overflow and the changed UI present. A passing upload alone is not browser QA.

Rollback: revert the offending source change through the normal PR process; the next `main` deployment rebuilds and publishes the earlier behaviour. Old hashed assets remain on the host so active sessions are not broken by cleanup.

Local deployment-boundary tests: `python3 -m unittest discover -s scripts -p test_deploy_ftp.py -v` (standard library only).

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
