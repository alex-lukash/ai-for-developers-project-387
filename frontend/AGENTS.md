# AGENTS.md — Frontend build rules

Guide for agents and contributors working in `frontend/`. Read this before touching code.

## Overview & stack

The app is the frontend for a heavily simplified Cal.com clone (scheduling/booking). Two roles, **no auth**:

- **Guest** — browses active event types and books a free slot within a 14-day window.
- **Owner (admin)** — creates/lists/edits event types and reviews all upcoming bookings.

`spec/` (TypeSpec, at the repo root) is the **single source of truth** for the domain and the HTTP API. The OpenAPI document and the typed API client are *generated* from it — never describe the API by hand.

**Stack:**

- TypeScript + Vite (React 19)
- Tailwind v4 + shadcn/ui (components added via the **shadcn MCP server**, CLI fallback)
- React Router v7 (data router) for routing
- TanStack Query for server state
- react-hook-form + zod for forms
- Stoplight Prism — mock API server driven by the generated OpenAPI doc
- `openapi-generator-cli` (`typescript-fetch`) — generates models + client into `src/api/generated/`
- Vitest + React Testing Library + MSW for tests

## Commands

Always use the root **`Makefile`** targets — do not hand-run `tsp`, `prism`, or the generator.

| Command | What it does |
| --- | --- |
| `make install` | Install `spec/` + `frontend/` dependencies |
| `make spec` | Compile TypeSpec → `spec/dist/openapi.yaml` |
| `make gen` | Generate the TS client → `frontend/src/api/generated/` (needs Java 11+) |
| `make mock` | Run the Prism mock API on `:4010` |
| `make dev` | Run the mock + Vite dev server together |
| `make build` | `tsc -b && vite build` |
| `make lint` | ESLint |
| `make test` | `vitest run` |
| `make dev-api` | Run Vite against the **real backend** (assumes the backend is up) |
| `make e2e` | Run the Playwright e2e suite (boots backend + frontend itself) |
| `make e2e-install` | One-time: install the Chromium browser for the e2e runner |

## Mock data

`make mock` / `make dev` serve **static examples** from the spec — the Prism mock
returns the `@example` / `@opExample` data declared in `spec/api.tsp`, so responses
are **consistent across calls** and domain-meaningful (Ada Lovelace, Intro Call /
Deep Dive, Grace Hopper / Alan Turing). Keep these examples aligned with the MSW
test fixtures in `src/test/handlers.ts` so dev and tests tell one story. Caveats of
a static mock: it ignores query params and request bodies (e.g. `include_inactive`
isn't applied; a POST echoes the canned example), and example dates are fixed, so
they drift into the past over time. For random fuzzing instead, run
`npm --prefix frontend run mock:dynamic` (Prism `--dynamic`).

## Workflow rule

After **any** change to `spec/api.tsp`, run:

```
make spec && make gen
```

to regenerate the OpenAPI document and the TypeScript client before relying on the types. Stale generated code is the most common source of confusing type errors.

## Conventions

- **Feature-first `src/` layout** — group code by feature (`features/event-types`, `features/bookings`, …), not by technical type.
- **TanStack Query owns server state** — components never call `fetch`/the generated client directly; go through query/mutation hooks in each feature's `api.ts`.
- **Forms** — react-hook-form + zod (`schema.ts` per feature).
- **UI** — shadcn components, added via the shadcn MCP server (fall back to `npx shadcn@latest` if the MCP server isn't connected — check `/mcp`).
- **Generated code is off-limits** — never hand-edit anything under `src/api/generated/`. Regenerate instead.
- The generated client is **camelCase**, the wire format is **snake_case**; the generated runtime mappers bridge them — don't add a second transform layer.

## Tailwind v4 rules

- Use only `@import "tailwindcss";` in `src/index.css`.
- **No** `postcss.config.*`, **no** `tailwind.config.*`, **no** `@tailwind base/components/utilities` directives. Mixing in v3 idioms is the #1 breakage point.

## TypeScript 6 strictness

- Use `import type` for all type-only and generated imports (`verbatimModuleSyntax` is on).
- No `enum` — use zod unions or `as const` (`erasableSyntaxOnly` is on).
- Prefix intentionally unused parameters with `_` (`noUnusedParameters` is on).

## Running against the real backend

The generated client calls **relative** `/api/...` (`src/api/client.ts`:
`basePath = import.meta.env.VITE_API_BASE_URL ?? '/api'`), and the Vite dev proxy
forwards `/api` to whatever `VITE_API_TARGET` points at. By default that's the Prism
mock (`:4010`, prefix stripped). To run the SPA against the **real Spring backend**
instead of the mock:

1. Start the backend in one terminal: `make backend-run` (serves `:8080`, base path `/api`).
2. In another terminal: `make dev-api` — runs Vite with
   `VITE_API_TARGET=http://localhost:8080 VITE_API_KEEP_PREFIX=true` (keeps the `/api`
   prefix, since the backend already mounts under it).

Because the browser only ever calls the same-origin `/api` and the **proxy** reaches
the backend, there is **no CORS** to configure. Do not set `VITE_API_BASE_URL` for this
(an absolute URL would make the browser call `:8080` cross-origin). `make dev` (Prism
mock) is unchanged.

## Testing

- Stack: Vitest + React Testing Library + MSW.
- Tests live next to their source as `*.test.ts(x)`; MSW handlers (hermetic, not Prism) live under `src/test/`.
- Run with `make test`. New features must ship with tests.

## End-to-end tests (Playwright)

Durable e2e specs in `frontend/e2e/*.spec.ts` (`@playwright/test`) drive a real browser
through the **whole stack** (Spring backend + H2, reached via the Vite proxy as above).

- **Run:** `make e2e-install` once (installs Chromium), then `make e2e`. The
  `playwright.config.ts` `webServer` block boots both the backend (`gradlew bootRun`)
  and the frontend (`npm run dev:backend`) itself, so no manual setup is needed; it
  reuses already-running servers locally.
- **Serial by design:** the backend is a single in-memory H2 with the global
  non-overlap rule (the owner can't be double-booked), so the config runs
  `workers: 1` / `fullyParallel: false`. H2 resets on each backend restart
  (`create-drop`); within one run, specs stay independent by picking the **first
  available slot dynamically** and using **unique slugs** (`e2e-…-${Date.now()}`).
- **Authoring/debugging:** use the **Playwright MCP server** (`browser_navigate`,
  `browser_snapshot`, `browser_click`, `browser_fill_form`, `browser_console_messages`)
  to walk a flow against the live stack and capture exact roles/labels, then encode it
  into a spec. This is the Playwright analog of the chrome-devtools flow below.
- New user-visible flows should get or extend an e2e spec.

## Verifying behaviour

Unit tests are not enough for anything a user can see or interact with. After a
change that affects the UI or runtime behaviour, verify it in a real browser
with the **chrome-devtools MCP server** before calling the task done:

1. Start the app: `make dev` (Prism mock on `:4010` + Vite, usually `:5173`).
2. Drive the affected page(s) via chrome-devtools MCP — `navigate_page`,
   `take_snapshot`, `list_console_messages`.
3. Confirm the page renders as expected **and the console has no errors/warnings**.

Required for any UI- or behaviour-affecting change. Pure refactors, type-only
edits, and changes with no runtime effect are exempt. If the chrome-devtools MCP
server isn't connected, check `/mcp`.

## Keep this guide current

When you introduce something a future agent could not infer from this file or
the code alone — a new command, workflow step, convention, constraint, gotcha,
or tool — update `AGENTS.md` (and root `CLAUDE.md` if it's repo-wide) in the same
change. Treat documentation drift as part of the bug.

## Don't touch

- **Never** modify `.github/workflows/hexlet-check.yml` (auto-generated Hexlet CI/grading).
- **Never** rename the repository.
- `make gen` requires a **Java 11+** runtime; the committed `src/api/generated/` lets `make build`/CI run without Java.

## Versioning

This package (`frontend`) is versioned **independently** via release-please from
[Conventional Commits](https://www.conventionalcommits.org/) — see [`../CONTRIBUTING.md`](../CONTRIBUTING.md).
Never hand-bump `package.json`'s `version` or edit `CHANGELOG.md`; release-please owns both.