/**
 * The partner test site (`partner-site/` in this repo, `pnpm partner`): another origin the demo embeds in
 * an iframe and opens in a web window. During development it runs on this computer; Android devices reach
 * it after `adb reverse tcp:8787 tcp:8787`.
 */
export const PARTNER_ORIGIN =
  (import.meta.env.VITE_PARTNER_ORIGIN as string | undefined) ?? 'http://localhost:8787'
export const PARTNER_URL = `${PARTNER_ORIGIN}/index.html`
