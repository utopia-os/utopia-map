/* eslint-disable no-catch-all/no-catch-all */
/* eslint-disable no-console */

/**
 * Safe localStorage utility that handles SecurityError gracefully
 * when localStorage is not available (e.g., private browsing mode)
 */
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key)
    } catch (error) {
      console.warn(`localStorage.getItem failed for key "${key}":`, error)
      return null
    }
  },

  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value)
    } catch (error) {
      console.warn(`localStorage.setItem failed for key "${key}":`, error)
      // Silently fail - functionality will work in memory-only mode
    }
  },

  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.warn(`localStorage.removeItem failed for key "${key}":`, error)
      // Silently fail
    }
  },
}