/**
 * Starts the demo backend. Run it with `pnpm api` from the Demo App (or `pnpm dev` here), next to
 * `wefter run <platform> --watch`.
 */

import { networkInterfaces } from 'node:os'
import { createApp } from './app.ts'
import { HOST, PORT } from './config.ts'

/** IPv4 addresses of this machine on the local network. */
function lanAddresses(): string[] {
  return Object.values(networkInterfaces())
    .flat()
    .filter((info) => info && info.family === 'IPv4' && !info.internal)
    .map((info) => info!.address)
}

const server = createApp().listen(PORT, HOST, () => {
  console.log(`Demo API listening on http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}/api`)
  if (HOST === '0.0.0.0') {
    for (const address of lanAddresses())
      console.log(`  on the network: http://${address}:${PORT}/api`)
  }
  console.log(
    'The app reaches it through the Vite dev server at /api (wefter run <platform> --watch).',
  )
})

server.on('error', (error: NodeJS.ErrnoException) => {
  console.error(
    error.code === 'EADDRINUSE'
      ? `Port ${PORT} is already in use. Stop the other server or set PORT in backend/.env.`
      : error.message,
  )
  process.exit(1)
})
