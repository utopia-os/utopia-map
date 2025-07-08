import { RichTextEditor } from '#components/Input/RichTextEditor/RichTextEditor'
import { fixUrls, mailRegex } from '#utils/ReplaceURLs'

import type { Item } from '#types/Item'

export const TextPreview = ({ item }: { item: Item }) => {
  let replacedText = ''

  if (!item.text) return null
  else replacedText = fixUrls(item.text)

  if (replacedText) {
    replacedText = replacedText.replace(mailRegex, (url) => {
      return `[${url}](mailto:${url})`
    })
  }

  return <RichTextEditor defaultValue={replacedText} readOnly={true} />
}
