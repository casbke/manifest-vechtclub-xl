// Turns Vite's single-file build into the body-only HTML the Artifact tool expects
// (it wraps the file in its own <!doctype>/<head>/<body> skeleton).
import { readFileSync, writeFileSync } from 'node:fs'
const src = readFileSync('dist/index.html', 'utf8')
const head = src.match(/<head>([\s\S]*?)<\/head>/i)?.[1] ?? ''
const body = src.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? ''
const keep = (re) => [...head.matchAll(re)].map(m => m[0]).join('\n')
const title = keep(/<title>[\s\S]*?<\/title>/gi)
const metas = keep(/<meta name="claude:[^>]*>/gi)
const links = keep(/<link[^>]*(fonts\.googleapis|fonts\.gstatic)[^>]*>/gi)
const styles = keep(/<style[\s\S]*?<\/style>/gi)
const headScripts = keep(/<script[\s\S]*?<\/script>/gi)
const out = [title, metas, links, styles, body.trim(), headScripts].filter(Boolean).join('\n')
writeFileSync('dist/artifact.html', out)
console.log(`artifact.html: ${(out.length / 1024).toFixed(0)} KB`)
