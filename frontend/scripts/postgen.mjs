// Post-processing for the openapi-generator typescript-fetch output.
//
// The generated client targets a permissive tsconfig, but this project compiles
// with strict flags (noUnusedLocals/Parameters, verbatimModuleSyntax). The
// generator emits dead imports (e.g. `mapValues`) and unused params that those
// flags reject. Rather than weaken the app's config, we prepend `// @ts-nocheck`
// to every generated file: type-checking is skipped for generated code while the
// exported interface types stay fully usable by importers.
//
// Runs as part of `npm run gen:api` after every regeneration. Do not edit the
// generated files by hand — re-run `make gen`.
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const GENERATED_DIR = new URL('../src/api/generated/', import.meta.url).pathname
const HEADER = '// @ts-nocheck'

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      walk(full)
    } else if (full.endsWith('.ts')) {
      const content = readFileSync(full, 'utf8')
      if (!content.startsWith(HEADER)) {
        writeFileSync(full, `${HEADER}\n${content}`)
      }
    }
  }
}

walk(GENERATED_DIR)
console.log('postgen: added // @ts-nocheck to generated client')
