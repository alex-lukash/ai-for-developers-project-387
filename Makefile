# Single entry point for the project. See frontend/AGENTS.md for conventions.
#
# Pipeline: spec/api.tsp --(tsp)--> spec/dist/openapi.yaml --(openapi-generator)-->
#           frontend/src/api/generated, and Prism mocks the same OpenAPI doc.
#
# `gen` requires a Java 11+ runtime. The generated client is committed, so
# `build`/`test`/`lint` run without Java; only `spec`/`gen`/`dev` need it.

.PHONY: install spec gen mock dev build lint test test-watch clean help

help:
	@echo "Targets: install spec gen mock dev build lint test test-watch clean"

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
