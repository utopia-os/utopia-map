import { toString } from 'mdast-util-to-string'
import remarkParse from 'remark-parse'
import { unified } from 'unified'

export function markdownToPlainText(markdown: string): string {
  const tree = unified().use(remarkParse).parse(markdown)

  let text = toString(tree)

  const container = document.createElement('div')
  container.innerHTML = text
  text = container.textContent ?? ''

  return text.replace(/\n{2,}/g, '\n\n').trim()
}
