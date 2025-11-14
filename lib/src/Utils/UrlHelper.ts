/**
 * Utility functions for managing browser URL and history
 */

/**
 * Updates the browser URL with an item ID while preserving query parameters
 * @param itemId - The item UUID to add to the URL
 */
export function setItemInUrl(itemId: string): void {
  const params = new URLSearchParams(window.location.search)
  const paramsString = params.toString()
  const newUrl = `/${itemId}${paramsString !== '' ? `?${paramsString}` : ''}`
  window.history.pushState({}, '', newUrl)
}

/**
 * Removes the item ID from the browser URL while preserving query parameters
 */
export function removeItemFromUrl(): void {
  const params = new URLSearchParams(window.location.search)
  const paramsString = params.toString()
  const newUrl = `/${paramsString !== '' ? `?${paramsString}` : ''}`
  window.history.pushState({}, '', newUrl)
}

/**
 * Updates a specific query parameter in the URL while preserving the path
 * @param key - The parameter key
 * @param value - The parameter value
 */
export function setUrlParam(key: string, value: string): void {
  const params = new URLSearchParams(window.location.search)
  params.set(key, value)
  const newUrl = window.location.pathname + '?' + params.toString()
  window.history.pushState({}, '', newUrl)
}

/**
 * Removes a specific query parameter from the URL
 * @param key - The parameter key to remove
 */
export function removeUrlParam(key: string): void {
  const params = new URLSearchParams(window.location.search)
  params.delete(key)
  const paramsString = params.toString()
  const newUrl = window.location.pathname + (paramsString !== '' ? `?${paramsString}` : '')
  window.history.pushState({}, '', newUrl)
}

/**
 * Resets page title and OpenGraph meta tags to default values
 */
export function resetMetaTags(): void {
  document.title = document.title.split('-')[0].trim()
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', document.title)
  const description = document.querySelector('meta[name="description"]')?.getAttribute('content')
  if (description) {
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description)
  }
}

/**
 * Updates page title and OpenGraph meta tags with item information
 * @param itemName - The name of the item
 * @param itemText - The text/description of the item
 */
export function updateMetaTags(itemName: string, itemText?: string): void {
  const baseTitle = document.title.split('-')[0].trim()
  document.title = `${baseTitle} - ${itemName}`
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', itemName)
  if (itemText) {
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', itemText)
  }
}
