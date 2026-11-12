import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const PROJECT_ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const SCANNED_ROOTS = ['apps', 'packages', 'supabase']
const IGNORED_DIRECTORIES = new Set(['node_modules', 'dist', 'build', '.expo', 'android', 'ios', '.temp'])
const EXPLICIT_ANY_PATTERNS = [
  /:\s*any\b/,
  /\bas\s+any\b/,
  /<\s*any\s*[>,]/,
  /,\s*any\s*>/,
  /\bany\s*\[\]/,
  /\bany\s*\|/,
  /\|\s*any\b/,
]

function listTypeScriptFiles(directory) {
  return readdirSync(directory).flatMap((name) => {
    if (IGNORED_DIRECTORIES.has(name)) return []
    const path = join(directory, name)
    if (statSync(path).isDirectory()) return listTypeScriptFiles(path)
    return /\.(ts|tsx)$/.test(name) && !name.endsWith('.d.ts') ? [path] : []
  })
}

function findExplicitAnyLines(path) {
  return readFileSync(path, 'utf8')
    .split('\n')
    .flatMap((line, index) => {
      const withoutStrings = line.replace(/(['"`]).*?\1/g, '""')
      return EXPLICIT_ANY_PATTERNS.some((pattern) => pattern.test(withoutStrings))
        ? [{ lineNumber: index + 1, text: line.trim() }]
        : []
    })
}

const violations = SCANNED_ROOTS.flatMap((root) => listTypeScriptFiles(join(PROJECT_ROOT, root))).flatMap(
  (path) => findExplicitAnyLines(path).map((violation) => ({ path: relative(PROJECT_ROOT, path), ...violation })),
)

if (violations.length > 0) {
  console.error('Explicit `any` is forbidden. Use `unknown` and narrow the type:')
  for (const { path, lineNumber, text } of violations) console.error(`  ${path}:${lineNumber}  ${text}`)
  process.exit(1)
}
console.log('No explicit `any` found.')
