import { defineStore } from 'pinia'

function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}
function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {}
}

export const useApp = defineStore('app', {
  state: () => ({
    sidebar: false,
    theme: (safeGetItem('wefter-theme') as 'dark' | 'light') || 'dark',
  }),

  getters: {
    getSidebarStatus: (state) => state.sidebar,
    isDark: (state) => state.theme === 'dark',
  },

  actions: {
    toggleSidebar() {
      this.sidebar = !this.sidebar
    },
    setSidebarStatus(status: boolean) {
      this.sidebar = status
    },
    openSidebar() {
      this.sidebar = true
    },
    closeSidebar() {
      this.sidebar = false
    },

    toggleTheme() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark'
      safeSetItem('wefter-theme', this.theme)
      this._applyTheme()
    },
    setTheme(t: 'dark' | 'light') {
      this.theme = t
      safeSetItem('wefter-theme', t)
      this._applyTheme()
    },
    _applyTheme() {
      document.documentElement.setAttribute('data-theme', this.theme)
    },
    initTheme() {
      this._applyTheme()
    },
  },
})
