export const urlRegex = /(?<!\]?\()(?<!<)https?:\/\/[^\s)]+(?!\))(?!>)/g
export const mailRegex = /(?<![[(])([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})(?![\])])/gi

export function fixUrls(message: string): string {
  message = message.replace(urlRegex, function (url) {
    let hyperlink = url.replace(' ', '')

    if (!hyperlink.match('^https?://')) {
      hyperlink = 'https://' + hyperlink
    }
    return hyperlink
  })

  return message
}
