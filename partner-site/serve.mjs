/**
 * Serves the partner test site on http://localhost:8787, so the Demo App can embed it in an iframe and
 * open it in a web window during development. Android emulators and devices reach it after
 * `adb reverse tcp:8787 tcp:8787`.
 */

import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('.', import.meta.url))
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css',
}
const port = Number(process.env.PORT ?? 8787)

createServer(async (request, response) => {
  const path = normalize(
    decodeURIComponent(new URL(request.url ?? '/', 'http://x').pathname),
  ).replace(/^(\.\.[/\\])+/, '')
  const file = join(root, path.endsWith('/') ? `${path}index.html` : path)
  try {
    const body = await readFile(file)
    response.writeHead(200, {
      'Content-Type': types[extname(file)] ?? 'application/octet-stream',
      'Cache-Control': 'no-store',
    })
    response.end(body)
  } catch {
    response.writeHead(404).end('Not found')
  }
}).listen(port, () => console.log(`Partner site on http://localhost:${port}`))
