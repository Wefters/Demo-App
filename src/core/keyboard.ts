/**
 * Closes the keyboard when the user taps outside a form field, as native apps do. The iOS shell hides the
 * bar with the Done button (`keyboard.accessoryBar` in `wefter.config.json`), and keyboards such as the
 * number pad have no key that closes them.
 */

/** Fields that keep the keyboard open when tapped. */
const FIELD_SELECTOR = 'input, textarea, select, [contenteditable]:not([contenteditable="false"])'

/** Blurs the focused field on any tap outside a field. Call once at startup. */
export function installTapToDismissKeyboard(): void {
  document.addEventListener(
    'pointerdown',
    (event) => {
      const active = document.activeElement
      if (!(active instanceof HTMLElement) || !active.matches(FIELD_SELECTOR)) return
      const target = event.target
      if (target instanceof Element && target.closest(FIELD_SELECTOR)) return
      active.blur()
    },
    { capture: true },
  )
}
