/** Entry point of the Wefter demo app: a Vue app with a page for each plugin. */

import '@/assets/css/index.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { installDeepLinkRouting } from './core/deep-links'
import { installTapToDismissKeyboard } from './core/keyboard'
import { hideSplashWhenReady } from './core/splash'

const app = createApp(App)

/**
 * Logs render errors. If the app failed before anything rendered, the error is shown on the page instead
 * of a blank screen.
 */
app.config.errorHandler = (err, _instance, info) => {
  console.error('[Wefter App Error]', info, err)
  const el = document.getElementById('app')
  if (el && el.children.length === 0) {
    el.innerHTML = `<div style="padding:20px;color:#f87171;font-family:monospace;font-size:13px;background:#0c0e18;min-height:100vh">
      <b>App Error (${info})</b><br/><pre style="white-space:pre-wrap">${String(err)}</pre>
    </div>`
  }
}

app.use(createPinia())
app.use(router)
installDeepLinkRouting(router)
installTapToDismissKeyboard()

app.mount('#app')
hideSplashWhenReady(router)
