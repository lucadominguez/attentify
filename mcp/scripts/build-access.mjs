#!/usr/bin/env node
// Bundle the app's real access-control module so the tests can exercise it.
//
// The source sits in a different place depending on which repo you are standing in:
//   private source repo (attentify-desktop):  ../src/main/debug/access.ts
//   public mirror (attentify):                ../desktop/src/main/debug/access.ts
// Hard-coding either one means `npm test` is broken in the other, which a contributor
// hits on their very first command. So look for it.
import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')

const candidates = [
  join(root, '..', 'src', 'main', 'debug', 'access.ts'),
  join(root, '..', 'desktop', 'src', 'main', 'debug', 'access.ts'),
]
const src = candidates.find(existsSync)

if (!src) {
  console.error(
    'Could not find access.ts. Looked in:\n' + candidates.map((c) => `  ${c}`).join('\n') +
    '\n\nThe tests exercise the desktop app\'s real access control, so they need the app\n' +
    'source alongside this package.',
  )
  process.exit(1)
}

const out = join(root, '.build', 'access.mjs')
// shell:true is required on Windows: npx is a .cmd shim, and spawnSync without a shell
// fails to launch it and reports nothing at all — an exit code 1 with empty output.
const r = spawnSync(
  'npx',
  ['esbuild', src, '--bundle', '--platform=node', '--format=esm', `--outfile=${out}`],
  { stdio: 'inherit', shell: true },
)
if (r.error) {
  console.error(`Could not run esbuild: ${r.error.message}`)
  process.exit(1)
}
if (r.status !== 0) {
  console.error(`esbuild failed (exit ${r.status}) building ${src}`)
  process.exit(r.status ?? 1)
}
console.log(`built ${out} from ${src}`)
