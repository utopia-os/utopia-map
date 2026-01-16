import { mergeAttributes, Node } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'

import {
  VIDEO_AUTOLINK_PATTERNS,
  getVideoCanonicalUrl,
  getVideoEmbedUrl,
  parseVideoUrl,
} from '#components/TipTap/utils/videoPatterns'

import type { NodeViewProps } from '@tiptap/react'

export interface VideoEmbedOptions {
  HTMLAttributes: Record<string, unknown>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    videoEmbed: {
      setVideoEmbed: (options: { provider: 'youtube' | 'rumble'; videoId: string }) => ReturnType
    }
  }
}

export const VideoEmbed = Node.create<VideoEmbedOptions>({
  name: 'videoEmbed',
  group: 'block',
  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  // Markdown tokenizer for @tiptap/markdown - recognizes <https://youtube.com/...> and <https://rumble.com/...> syntax
  markdownTokenizer: {
    name: 'videoEmbed',
    level: 'inline',
    // Fast hint for the lexer - where might a video embed start?
    start: (src: string) => {
      // Look for autolinks with video URLs
      const youtubeIndex = src.indexOf('<https://www.youtube.com/watch')
      const youtubeShortIndex = src.indexOf('<https://youtu.be/')
      const rumbleIndex = src.indexOf('<https://rumble.com/embed/')

      const indices = [youtubeIndex, youtubeShortIndex, rumbleIndex].filter((i) => i >= 0)
      return indices.length > 0 ? Math.min(...indices) : -1
    },
    tokenize: (src: string) => {
      // Match YouTube autolinks: <https://www.youtube.com/watch?v=VIDEO_ID>
      let match = VIDEO_AUTOLINK_PATTERNS.youtube.exec(src)
      if (match) {
        return {
          type: 'videoEmbed',
          raw: match[0],
          provider: 'youtube',
          videoId: match[1],
        }
      }

      // Match YouTube short autolinks: <https://youtu.be/VIDEO_ID>
      match = VIDEO_AUTOLINK_PATTERNS.youtubeShort.exec(src)
      if (match) {
        return {
          type: 'videoEmbed',
          raw: match[0],
          provider: 'youtube',
          videoId: match[1],
        }
      }

      // Match Rumble autolinks: <https://rumble.com/embed/VIDEO_ID>
      match = VIDEO_AUTOLINK_PATTERNS.rumble.exec(src)
      if (match) {
        return {
          type: 'videoEmbed',
          raw: match[0],
          provider: 'rumble',
          videoId: match[1],
        }
      }

      return undefined
    },
  },

  // Parse Markdown token to Tiptap JSON
  parseMarkdown(token: { provider: string; videoId: string }) {
    return {
      type: 'videoEmbed',
      attrs: {
        provider: token.provider,
        videoId: token.videoId,
      },
    }
  },

  // Serialize Tiptap node to Markdown
  renderMarkdown(node: { attrs: { provider: string; videoId: string } }) {
    const { provider, videoId } = node.attrs
    const url = getVideoCanonicalUrl(provider as 'youtube' | 'rumble', videoId)
    return `<${url}>`
  },

  addAttributes() {
    return {
      provider: {
        default: 'youtube',
        parseHTML: (element: HTMLElement) => element.getAttribute('provider'),
        renderHTML: (attributes: Record<string, unknown>) => {
          return { provider: attributes.provider }
        },
      },
      videoId: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('video-id'),
        renderHTML: (attributes: Record<string, unknown>) => {
          return { 'video-id': attributes.videoId }
        },
      },
    }
  },

  parseHTML() {
    return [{ tag: 'video-embed' }]
  },

  renderHTML({ node, HTMLAttributes }) {
    const { provider, videoId } = node.attrs as { provider: string; videoId: string }
    const src = getVideoEmbedUrl(provider as 'youtube' | 'rumble', videoId)

    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: 'video-embed-wrapper',
      }),
      [
        'iframe',
        {
          src,
          allowfullscreen: 'true',
          allow: 'fullscreen; picture-in-picture',
          class: 'video-embed',
          frameborder: '0',
        },
      ],
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoEmbedComponent)
  },

  addCommands() {
    return {
      setVideoEmbed:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          })
        },
    }
  },

  addProseMirrorPlugins() {
    const nodeType = this.type

    return [
      new Plugin({
        key: new PluginKey('videoEmbedPaste'),
        props: {
          handlePaste(view, event) {
            const text = event.clipboardData?.getData('text/plain')
            if (!text) return false

            const videoInfo = parseVideoUrl(text.trim())
            if (!videoInfo) return false

            // Insert video embed node
            const { state, dispatch } = view
            const node = nodeType.create(videoInfo)
            const tr = state.tr.replaceSelectionWith(node)
            dispatch(tr)

            return true
          },
        },
      }),
    ]
  },
})

/**
 * React component for rendering video embeds in the editor.
 * Shows an iframe preview of YouTube/Rumble videos.
 */
function VideoEmbedComponent({ node }: NodeViewProps) {
  const { provider, videoId } = node.attrs as { provider: string; videoId: string }
  const src = getVideoEmbedUrl(provider as 'youtube' | 'rumble', videoId)

  return (
    <NodeViewWrapper>
      <div className='video-embed-wrapper' contentEditable={false}>
        <iframe
          src={src}
          allowFullScreen
          allow='fullscreen; picture-in-picture'
          className='video-embed'
          style={{ border: 'none' }}
        />
      </div>
    </NodeViewWrapper>
  )
}
