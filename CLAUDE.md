# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository status

A Hexlet educational project (course "AI for developers") — a heavily simplified Cal.com clone. The domain/API is specified in TypeSpec (`spec/`) and code is generated from it on both ends:

- **`frontend/`** — TypeScript + Vite (React 19). Build rules: [`frontend/AGENTS.md`](frontend/AGENTS.md).
- **`backend/`** — Kotlin + Spring Boot + H2 (in-memory). Build rules: [`backend/AGENTS.md`](backend/AGENTS.md).
- **`spec/`** — TypeSpec → `spec/dist/openapi.yaml`, the single source of truth consumed by both ends.

Per-stack build / lint / test commands and conventions live in each `AGENTS.md`; the root `Makefile` is the single entry point (frontend targets plus `backend-build` / `backend-test` / `backend-run`).

**Full-stack & e2e.** The frontend can run against the real backend instead of the Prism mock: `make backend-run` (terminal 1) + `make dev-api` (terminal 2) — same-origin via the Vite proxy, no CORS. Durable Playwright e2e tests live in `frontend/e2e/`; run them with `make e2e` (after `make e2e-install` once), which boots both servers and exercises the whole stack. Details in [`frontend/AGENTS.md`](frontend/AGENTS.md).

**CI.** Our tests run on every push/PR via [`.github/workflows/ci.yml`](.github/workflows/ci.yml) — jobs: `commitlint`, `frontend` (lint + Vitest + build), `backend` (Gradle tests), `e2e` (Playwright, full stack). This is separate from the auto-generated `hexlet-check.yml` (Hexlet grading), which must never be edited.

**Commit conventions.** All commits **and PR titles** must follow [Conventional Commits](https://www.conventionalcommits.org/) — see [`CONTRIBUTING.md`](CONTRIBUTING.md) for the types, allowed scopes (`frontend`/`backend`/`spec`/`e2e`/`ci`/`deps`/`release`/`repo`), and breaking-change rules. This is enforced by commitlint in CI ([`.commitlintrc.json`](.commitlintrc.json)) and consumed by **release-please** ([`.github/workflows/release-please.yml`](.github/workflows/release-please.yml) + `release-please-config.json`) to version and changelog the three packages automatically. Write commits accordingly (the `Co-Authored-By:` trailer is a valid footer); never hand-bump versions or changelogs.

## Keeping these instructions current

When a change introduces something a future agent could not infer from these
instructions or the code alone (a new command, workflow, convention, constraint,
or tool), update the relevant instruction file in the same change — root
`CLAUDE.md` for repo-wide facts, [`frontend/AGENTS.md`](frontend/AGENTS.md) for
frontend specifics. Treat documentation drift as part of the bug.

## Verifying behaviour

Changes that affect the UI or runtime behaviour must be verified in a real
browser using the **chrome-devtools MCP server** (navigate, snapshot, check the
console) — not just unit tests. The chrome-devtools and shadcn MCP servers are
enabled for this repo. See [`frontend/AGENTS.md`](frontend/AGENTS.md) for the
exact flow.

## What we are building

The application is a heavily simplified analog of Cal.com (a scheduling/booking tool). There are two roles and **no registration or authentication**:

- **Owner** — a single, predefined profile (used by default in the admin area). Creates event types and reviews upcoming bookings across all types.
- **Guest** — browses event types and books a free slot within the next 14 days, with no account or login.

Key rules:
- A booking cannot overlap an existing booking, **even across different event types** — the single owner can't be double-booked.
- Available slots are generated on the fly for a 14-day window starting from the current date; they are not stored.

The full domain/data model — entities (`Owner`, `EventType`, `Booking`), fields, relationships, the busyness rule, slot-generation algorithm, and open assumptions — lives in **[`spec/data-model.md`](spec/data-model.md)**. Treat that document as the source of truth for the domain; keep it in sync when requirements change.

## Critical constraint: do not touch Hexlet CI wiring

`.github/workflows/hexlet-check.yml` is auto-generated and runs the graded tests on every push (it invokes the `hexlet/project-action`). Per Hexlet's instructions:

- Do **not** delete, edit, or rename `hexlet-check.yml`.
- Do **not** rename the repository.

Breaking any of these detaches the repo from Hexlet's automated grading.

## How grading works

Tests run automatically on every commit via the `hexlet-check` GitHub Action. They only become meaningful once the corresponding tasks are marked complete in the Hexlet web interface — so the workflow is: complete tasks in the Hexlet UI, commit, push, and the action grades the result. The CI badge in `README.md` reflects the latest run.