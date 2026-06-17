# Contributing

## Commit messages — Conventional Commits

This repo uses [Conventional Commits](https://www.conventionalcommits.org/). The rules
below are **enforced by commitlint in CI** and **consumed by
[release-please](https://github.com/googleapis/release-please)** to compute versions and
generate changelogs — so they are not just style, they drive releases.

### Format

```
<type>(<scope>)?(!)?: <subject>

[optional body]

[optional footer(s)]
```

- **type** — one of the types below (required).
- **scope** — optional; when present, one of the allowed scopes.
- **!** — optional breaking-change marker (after the type/scope).
- **subject** — imperative mood, lower-case start, **no trailing period**, ≤ 100 chars.

### Types and their release impact

| Type | When to use | Release bump |
| --- | --- | --- |
| `feat` | A new user-facing feature | **minor** (`0.1.0`) |
| `fix` | A bug fix | **patch** (`0.0.1`) |
| `perf` | A performance improvement | patch |
| `docs` | Documentation only | none |
| `refactor` | Code change that neither fixes a bug nor adds a feature | none |
| `test` | Adding/adjusting tests | none |
| `build` | Build system or dependencies | none |
| `ci` | CI configuration / workflows | none |
| `chore` | Maintenance, no production code change | none |
| `style` | Formatting only (no logic change) | none |
| `revert` | Reverts a previous commit | none |

**Breaking changes** bump the **major** version regardless of type — mark them with a
`!` (e.g. `feat(spec)!: …`) **and/or** a `BREAKING CHANGE:` footer describing the break.

### Scopes

Optional, but use one when it fits. Allowed scopes (enforced by commitlint):

`frontend` · `backend` · `spec` · `e2e` · `ci` · `deps` · `release` · `repo`

release-please routes each commit to a package by the **path of the files it changes**
(`frontend/**` → the frontend package, `backend/**` → backend, `spec/**` → spec), so the
scope is informational — keep it consistent with the area you touched. Root/infra files
that match no deeper package (`Dockerfile`, `.github/**`, `CONTRIBUTING.md`, root configs,
…) route to the **`repo`** package (path `"."`) and **do** trigger a release.

### Examples

```
feat(backend): enforce booking overlap rule across event types
fix(frontend): render slot times in the owner timezone
docs: document Conventional Commits and release-please
ci: add commitlint job to CI
test(backend): cover slot grid generation
feat(spec)!: rename booking.start to booking.start_at

BREAKING CHANGE: clients must send `start_at` instead of `start`.
```

Bad (rejected by commitlint):

```
added stuff                 # no type
Fix bug.                    # capitalized, trailing period, no type
feat(api): ...              # `api` is not an allowed scope
```

### Pull requests & squash merges

When a PR is **squash-merged**, GitHub uses the **PR title** as the commit message — so
the **PR title must itself be a valid Conventional Commit**. That single squashed commit
is what release-please reads.

## Releases

Releases are automated by release-please. On every push to `main` it opens/updates a
**release PR** that bumps versions and updates `CHANGELOG.md` files based on the commits
since the last release. Merging that PR creates the git tags and GitHub releases. You do
not bump versions or write changelogs by hand — just write good Conventional Commits.

Every package (including the repo root, the **`repo`** package) versions from its
`0.1.0` baseline in `.release-please-manifest.json`.

### Always bump the version

Every shippable change must move a version. Because only **release-bumping types** advance
the version (`feat` → minor, `fix`/`perf` → patch, breaking `!` → major) — `chore`, `docs`,
`ci`, `build`, `refactor`, `test`, `style` bump **nothing** — that means:

- Commit substantive work with `feat`/`fix`/`perf` (or a breaking `!`), not `chore`/`docs`.
  Reserve the non-bumping types for genuinely release-irrelevant changes.
- Every path now belongs to a package — `frontend`/`backend`/`spec` for their dirs, the
  **`repo`** package (`"."`) for everything else — so even a root-only change (a `Dockerfile`
  or CI tweak) bumps a version when committed with a bumping type.
- **Never** add a `release-as` pin to `release-please-config.json`. It forces every release
  to a fixed version and freezes versioning (this is exactly what stuck the repo at `0.1.0`).
