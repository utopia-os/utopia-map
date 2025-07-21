import { RichTextEditor } from '#components/Input/RichTextEditor/RichTextEditor'
import { fixUrls, mailRegex } from '#utils/ReplaceURLs'

import type { Item } from '#types/Item'

/**
 * @category Map
 */
export const TextView = ({ item, rawText }: { item?: Item; rawText?: string }) => {
  let innerText = ''
  let replacedText = ''

  if (rawText) {
    innerText = replacedText = rawText
  } else if (item) {
    innerText = item.text ?? ''
  }

  if (innerText) replacedText = fixUrls(innerText)

  if (replacedText) {
    replacedText = replacedText.replace(mailRegex, (url) => {
      return `[${url}](mailto:${url})`
    })
  }

  return <RichTextEditor defaultValue={replacedText} readOnly={true} />
}
