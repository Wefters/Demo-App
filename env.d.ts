/// <reference types="vite/client" />

/** Environment variables the app reads. Set them in `.env.local`; see `.env.example`. */
interface ImportMetaEnv {
  /** Full URL of the demo backend, such as `https://my-tunnel.example.com/api`. See `src/config/api.ts`. */
  readonly VITE_API_URL?: string
}
