/** App-wide UI state: whether the sidebar is open and the colour theme, which is saved between launches. */

import { defineStore } from 'pinia'

/** `localStorage.getItem` that returns `null` when storage is unavailable. */
function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}
/** `localStorage.setItem` that ignores storage being unavailable. */
function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {}
}

/** Store for the sidebar and theme. */
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

    /** Switches between dark and light, saves the choice and applies it. */
    toggleTheme() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark'
      safeSetItem('wefter-theme', this.theme)
      this._applyTheme()
    },
    /** Sets the theme, saves it and applies it. */
    setTheme(t: 'dark' | 'light') {
      this.theme = t
      safeSetItem('wefter-theme', t)
      this._applyTheme()
    },
    /** Applies the theme through the `data-theme` attribute on `<html>`. */
    _applyTheme() {
      document.documentElement.setAttribute('data-theme', this.theme)
    },
    /** Applies the saved theme at start-up. */
    initTheme() {
      this._applyTheme()
    },
  },
})
