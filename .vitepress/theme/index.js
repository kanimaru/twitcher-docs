import DefaultTheme from 'vitepress/theme'
import './custom.css'
import { inBrowser, onContentUpdated } from 'vitepress'

// Keeps every "GDScript / C#" code-group on the site in sync: picking a
// language in one group switches all others (and persists across page loads),
// the same way the Godot docs let you switch the whole page between
// GDScript and C#.
const STORAGE_KEY = 'twitcher-docs-lang'
const LANGS = ['GDScript', 'C#']

function applyLang(lang, anchorEl) {
  // Switching languages changes the height of every code-group on the page
  // (C# examples are usually longer than GDScript), which would otherwise
  // shift content the user is looking at. Anchor on the element they clicked
  // (or, on initial load, the group nearest the top of the viewport) and
  // correct the scroll position by however much it moved once we're done.
  if (!anchorEl) {
    anchorEl = Array.from(document.querySelectorAll('.vp-code-group')).find(
      (g) => g.getBoundingClientRect().bottom > 0
    )
  }
  const anchorTop = anchorEl ? anchorEl.getBoundingClientRect().top : null

  document.querySelectorAll('.vp-code-group').forEach((group) => {
    const label = group.querySelector(`.tabs label[data-title="${lang}"]`)
    if (!label) return // this group doesn't have that language, leave it alone

    const input = group.querySelector(`#${CSS.escape(label.getAttribute('for'))}`)
    const labels = Array.from(group.querySelectorAll('.tabs label'))
    const blocks = group.querySelector('.blocks')
    if (!input || !blocks) return

    const index = labels.indexOf(label)
    if (index < 0) return

    input.checked = true
    Array.from(blocks.children).forEach((child, i) => {
      child.classList.toggle('active', i === index)
    })
  })

  if (anchorEl && anchorTop !== null) {
    const delta = anchorEl.getBoundingClientRect().top - anchorTop
    if (delta) window.scrollBy(0, delta)
  }
}

function currentLang() {
  return inBrowser ? localStorage.getItem(STORAGE_KEY) : null
}

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    if (!inBrowser) return

    // Re-apply the saved preference whenever the page content changes
    // (client-side navigation, dev server hot updates, etc.). VitePress's own
    // dev-mode code-group handler *also* runs on this same hook and resets
    // every group back to its first tab, so our re-apply is deferred below
    // to always run after it instead of racing it (otherwise the radio can
    // end up checked on C# while the visible block is still GDScript).
    onContentUpdated(() => {
      const lang = currentLang()
      if (!lang) return
      // setTimeout (not requestAnimationFrame) on purpose: rAF only fires on
      // a compositor frame, which never happens for a backgrounded/hidden
      // tab, so a fix relying on it can silently stop working. setTimeout
      // still runs after the current synchronous batch (and VitePress's own
      // dev-mode reset within it) regardless of tab visibility.
      setTimeout(() => applyLang(lang), 0)
    })

    // Capture the click before VitePress's own per-group toggle handler runs,
    // so we can broadcast the choice to every code-group on the page instead
    // of just the one that was clicked.
    window.addEventListener(
      'click',
      (e) => {
        const el = e.target
        if (!(el instanceof Element) || !el.matches('.vp-code-group .tabs input')) return

        const group = el.closest('.vp-code-group')
        const label = group?.querySelector(`label[for="${el.id}"]`)
        const lang = label?.getAttribute('data-title')
        if (!lang || !LANGS.includes(lang)) return

        localStorage.setItem(STORAGE_KEY, lang)
        applyLang(lang, group)
        e.stopPropagation()
      },
      true
    )
  }
}
