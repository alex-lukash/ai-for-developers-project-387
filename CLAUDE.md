# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository status

This is a starter scaffold for a Hexlet educational project (course "AI for developers"). It contains **no application source code yet** — only project metadata, CI wiring, and a domain specification (see below). The project's language, build tooling, and test framework are not yet established and will be added as the course is completed.

When source code first lands, update this file with the real build / lint / test commands and architecture notes.

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