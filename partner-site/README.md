# Partner test site

Another origin for the Demo App's "Embedded sites" page: it is shown in an iframe and in a web window, and talks to the app through `@wefterjs/frame`.

```bash
pnpm partner                       # serves it on http://localhost:8787
adb reverse tcp:8787 tcp:8787      # Android devices and emulators
```

`wefter.config.json` allows it to load (`frames.allow`) and grants it `haptics.*` (`frames.plugins`), so its "Vibrate" button works and "Read clipboard" is refused.

`wefter-frame.js` and `wefter-core.js` are copies of `packages/frame/dist/wefter-frame.js` and `packages/core/dist/wefter-test-global.js` (`pnpm --filter @wefterjs/core build:testpage`) from the Wefter repo; copy them again after changing those packages.
