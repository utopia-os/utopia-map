import { useEffect } from 'react'

/**
 * Apply a theme based on the saved preference, a provided default theme, or the user's system preference.
 * Falls back to the system dark/light preference when no theme is provided.
 */
export const useTheme = (defaultTheme = 'default') => {
  useEffect(() => {
    const savedThemeRaw = localStorage.getItem('theme')
    const savedTheme = savedThemeRaw ? (JSON.parse(savedThemeRaw) as string) : undefined

    const prefersDark =
      typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
        : false

    const fallbackTheme =
      defaultTheme && defaultTheme !== 'default' ? defaultTheme : prefersDark ? 'dark' : 'light'

    const themeToApply = savedTheme ?? fallbackTheme

    if (themeToApply === 'default') {
      document.documentElement.removeAttribute('data-theme')
      localStorage.removeItem('theme')
      return
    }

    document.documentElement.setAttribute('data-theme', themeToApply)

    if (!savedTheme || savedTheme !== themeToApply) {
      localStorage.setItem('theme', JSON.stringify(themeToApply))
    }
  }, [defaultTheme])
}
