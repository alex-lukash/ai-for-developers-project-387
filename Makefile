# Single entry point for the project. See frontend/AGENTS.md for conventions.
#
# Pipeline: spec/api.tsp --(tsp)--> spec/dist/openapi.yaml --(openapi-generator)-->
#           frontend/src/api/generated, and Prism mocks the same OpenAPI doc.
#
# `gen` requires a Java 11+ runtime. The generated client is committed, so
# `build`/`test`/`lint` run without Java; only `spec`/`gen`/`dev` need it.

.PHONY: install spec gen mock dev build lint test test-watch clean help \
        backend-build backend-test backend-run dev-api e2e e2e-install

help:
	@echo "Frontend: install spec gen mock dev build lint test test-watch clean"
	@echo "Backend:  backend-build backend-test backend-run"
	@echo "Full-stack: dev-api (frontend -> running backend) e2e e2e-install"

install:
	npm --prefix spec install
	npm --prefix frontend install

# Compile TypeSpec -> spec/dist/openapi.yaml
spec:
	npm --prefix spec run compile

# Regenerate the typed API client from the OpenAPI doc (needs Java 11+).
gen: spec
	npm --prefix frontend run gen:api

# Run the Prism mock API on :4010 (recompiles the spec it mocks first).
mock: spec
	npm --prefix frontend run mock

# Recompile spec + client, then run the mock and Vite together.
dev: gen
	npm --prefix frontend run dev:all

build:
	npm --prefix frontend run build

lint:
	npm --prefix frontend run lint

test:
	npm --prefix frontend run test

test-watch:
	npm --prefix frontend run test:watch

clean:
	rm -rf spec/dist frontend/src/api/generated frontend/dist

# --- Backend (Kotlin + Spring Boot). See backend/AGENTS.md. ---------------
# Each target refreshes the spec first so the Gradle `openApiGenerate` step
# (models + Spring API interfaces) reads an up-to-date OpenAPI doc.

# Compile + run all backend tests.
backend-build: spec
	cd backend && ./gradlew build

# Run the backend test suite.
backend-test: spec
	cd backend && ./gradlew test

# Run the backend on :8080 (context path /api).
backend-run: spec
	cd backend && ./gradlew bootRun

# --- Full-stack (frontend + real backend) + e2e. See frontend/AGENTS.md. ---

# Run the Vite dev server pointed at the real backend (assumes `make backend-run`
# is up in another terminal). Same-origin via the Vite proxy, so no CORS needed.
dev-api:
	npm --prefix frontend run dev:backend

# Run the Playwright e2e suite. Playwright boots both servers (backend + frontend)
# itself; `spec` keeps the OpenAPI doc fresh for the backend's codegen.
e2e: spec
	npm --prefix frontend run e2e

# One-time: install the Chromium browser used by the e2e runner.
e2e-install:
	npx --prefix frontend playwright install chromium
