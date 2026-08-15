import '@/assets/css/index.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

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

app.mount('#app')
