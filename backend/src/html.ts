/** Small helpers for the backend's HTML pages: escaping and a shared mobile-friendly layout. */

/** Escapes text for use in HTML content and attribute values. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Styles shared by every page, following the system light or dark setting. */
const STYLES = `
  :root { color-scheme: light dark; --bg: #f6f7f9; --card: #fff; --text: #16181d; --muted: #646b78;
    --line: #e2e5ea; --accent: #3b6fd8; --accent-text: #fff; --danger: #c2413b; }
  @media (prefers-color-scheme: dark) { :root { --bg: #111314; --card: #1b1d21; --text: #e8e9ec;
    --muted: #9aa0ab; --line: #2b2e34; --accent: #6f9be8; --accent-text: #0d1117; --danger: #ef7d76; } }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 24px 16px; background: var(--bg); color: var(--text);
    font: 15px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif; }
  main { max-width: 440px; margin: 0 auto; display: flex; flex-direction: column; gap: 16px; }
  .card { background: var(--card); border: 1px solid var(--line); border-radius: 16px; padding: 20px; }
  h1 { font-size: 20px; margin: 0 0 4px; } h2 { font-size: 13px; margin: 0 0 10px; color: var(--muted);
    text-transform: uppercase; letter-spacing: .06em; }
  p { margin: 0 0 12px; color: var(--muted); } code { font: 13px ui-monospace, Menlo, monospace; word-break: break-all; }
  label { display: block; font-size: 13px; color: var(--muted); margin-bottom: 6px; }
  input { width: 100%; padding: 10px 12px; border: 1px solid var(--line); border-radius: 10px;
    background: var(--bg); color: var(--text); font: inherit; margin-bottom: 14px; }
  .actions { display: flex; gap: 10px; }
  button, .button { flex: 1; display: block; text-align: center; padding: 11px 14px; border-radius: 10px;
    border: 1px solid var(--line); background: transparent; color: var(--text); font: inherit;
    font-weight: 600; text-decoration: none; cursor: pointer; }
  .primary { background: var(--accent); border-color: var(--accent); color: var(--accent-text); }
  .links { display: flex; flex-direction: column; gap: 8px; }
  .error { color: var(--danger); }
`

/** A complete HTML page with the shared layout. `body` must already be escaped. */
export function page(title: string, body: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <style>${STYLES}</style>
  </head>
  <body>
    <main>${body}</main>
  </body>
</html>
`
}
