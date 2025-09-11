/* eslint-disable security/detect-object-injection */
import de from './locales/de.json'
import dsb from './locales/dsb.json'
import hsb from './locales/hsb.json'

const resources: Record<string, Record<string, string>> = {
  de: de as Record<string, string>,
  dsb: dsb as Record<string, string>,
  hsb: hsb as Record<string, string>,
}

const getBrowserLanguage = (): string => {
  const lang = navigator.language.split('-')[0]
  return Object.prototype.hasOwnProperty.call(resources, lang) ? lang : 'de'
}

const currentLanguage = getBrowserLanguage()

document.documentElement.lang = currentLanguage

export const t = (key: string, params: Record<string, string> = {}): string => {
  const langResources = Object.prototype.hasOwnProperty.call(resources, currentLanguage)
    ? resources[currentLanguage]
    : resources.de
  let text = Object.prototype.hasOwnProperty.call(langResources, key) ? langResources[key] : key
  for (const [k, v] of Object.entries(params)) {
    text = text.replace(`{${k}}`, v)
  }
  return text
}

export default currentLanguage
