# AGENTS.md — Backend build rules

Guide for agents and contributors working in `backend/`. Read this before touching
code. Mirrors [`frontend/AGENTS.md`](../frontend/AGENTS.md): same spec/codegen and
testing philosophy, JVM side.

## Overview & stack

The backend serves the API for a heavily simplified Cal.com clone (scheduling/booking).
Two roles, **no auth**:

- **Guest** — browses active event types and books a free slot within a 14-day window.
- **Owner (admin)** — creates/lists/edits event types and reviews all upcoming bookings.

Domain rules to respect: a single predefined owner; available slots are generated on
the fly for a 14-day window (never stored); a booking may not overlap any existing
booking **globally**, even across different event types (the owner can't be
double-booked).

`spec/` (TypeSpec, at the repo root) is the **single source of truth** for the domain
and the HTTP API. The OpenAPI document and the typed models + Spring API interfaces are
*generated* from it — never describe the API by hand.

**Stack:**

- Kotlin + Spring Boot 4.1 (Java 25 toolchain, resolved by Gradle)
- Spring Web (REST) + Spring Data JPA
- H2 — in-memory database (ephemeral per run)
- Bean Validation (Jakarta) for request payloads
- Jackson (`jackson-module-kotlin`) — JSON, snake_case wire format
- `openapi-generator` Gradle plugin (`kotlin-spring`) — generates models + API
  interfaces into `build/generated/`
- JUnit 5 + Spring Boot Test + MockMvc for tests

## `spec/` is the single source of truth

The OpenAPI doc (`spec/dist/openapi.yaml`) and the generated DTO models + Spring API
interfaces come from `spec/api.tsp`. Never hand-write request/response types or
describe an endpoint's shape by hand — change the TypeSpec and regenerate.

## Commands

| Command | What it does |
| --- | --- |
| `./gradlew bootRun` | Run the app on `:8080` (codegen runs first) |
| `./gradlew build` | Compile + run all tests (runs `openApiGenerate` first) |
| `./gradlew test` | Run tests |
| `./gradlew openApiGenerate` | (Re)generate models + API interfaces into `build/generated/` |

From the repo root you can also use the `Makefile`:

| Command | What it does |
| --- | --- |
| `make backend-build` | `spec` + `./gradlew -p backend build` |
| `make backend-test` | `spec` + `./gradlew -p backend test` |
| `make backend-run` | `spec` + `./gradlew -p backend bootRun` |

Code generation is wired into the Gradle build — `openApiGenerate` runs before
`compileKotlin`. Do **not** invoke the generator by hand.

## Workflow rule

After **any** change to `spec/api.tsp`, run:

```
make spec
```

to refresh `spec/dist/openapi.yaml`, then rebuild the backend (`make backend-build` or
`./gradlew -p backend build`) so `openApiGenerate` regenerates the models + API
interfaces. Stale generated code is the most common source of confusing compile errors.

## Conventions

- **Layered packages** under `dev.lukash.backend`: `domain` (JPA entities),
  `repository` (Spring Data), `service` (business logic), `web` (controllers, mappers,
  exception handling), `config` (datasource/seed). Generated code lives under
  `dev.lukash.backend.generated.{api,model}`.
- **Controllers implement the generated API interfaces** and delegate to services —
  they never define the HTTP contract themselves.
- **JPA entities are separate from generated DTOs.** Map between them in `web` mappers;
  don't annotate generated models with JPA.
- **Generated code is off-limits** — never hand-edit anything under
  `build/generated/**`. Regenerate instead.
- The wire format is **snake_case**, driven by the generated DTOs' Jackson
  `@JsonProperty` annotations — don't add a second transform layer.
- All timestamps are **UTC** (`java.time.Instant`); the owner's `timezone` is exposed
  via `GET /owner` so the frontend renders local time.
- Errors share one envelope: `{ "error": { code, message, fields? } }` with the stable
  codes from `spec/api.tsp` (`validation_failed`, `slot_in_past`, `slot_out_of_window`,
  `slot_not_on_grid`, `slot_taken`, `event_type_not_found`, `slug_taken`).
- **No CORS config** is needed: the frontend reaches the backend same-origin through the
  Vite dev proxy (`make dev-api` / the Playwright e2e `webServer`), so the browser never
  makes a cross-origin request. See [`frontend/AGENTS.md`](../frontend/AGENTS.md).

## Persistence / H2

- In-memory `jdbc:h2:mem:…`; schema created by JPA `ddl-auto`. Data is **ephemeral** —
  it resets on every restart.
- The single `Owner` and sample event types are **seeded on startup**, aligned with the
  `@example` data in `spec/api.tsp` (Ada Lovelace; `intro-call` 30m, `deep-dive` 60m).
- The global non-overlap rule is enforced at the **application level** (an overlap query
  before insert); H2 has no `EXCLUDE` constraint, so a `UNIQUE(start_at)` column is the
  only DB-level guard.

## Testing

- Stack: JUnit 5 + Spring Boot Test + MockMvc (H2 in-memory).
- Tests live under `src/test/kotlin`, mirroring the package of the code under test.
- Unit tests for slot generation (`SlotService`) and the overlap rule
  (`BookingService`); web tests assert status codes and the error-envelope shape for
  every error code.
- Run with `./gradlew test` / `make backend-test`. **New features must ship with tests.**

## Don't touch

- **Never** modify `.github/workflows/hexlet-check.yml` (auto-generated Hexlet
  CI/grading).
- **Never** rename the repository.
- **Never** hand-edit generated code under `build/generated/**` — regenerate.

## Keep this guide current

When you introduce something a future agent could not infer from this file or the code
alone — a new command, workflow step, convention, constraint, gotcha, or tool — update
`AGENTS.md` (and root `CLAUDE.md` if it's repo-wide) in the same change. Treat
documentation drift as part of the bug.

## Versioning

This package (`backend`) is versioned **independently** via release-please from
[Conventional Commits](https://www.conventionalcommits.org/) — see [`../CONTRIBUTING.md`](../CONTRIBUTING.md).
Never hand-bump the version or edit `CHANGELOG.md`; release-please owns both.
