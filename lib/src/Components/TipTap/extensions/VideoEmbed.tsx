import { mergeAttributes, Node } from '@tiptap/core'
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'
import { Plugin, PluginKey } from '@tiptap/pm/state'

import type { NodeViewProps } from '@tiptap/react'

// Regex patterns for video URL detection
const YOUTUBE_REGEX = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/
const YOUTUBE_SHORT_REGEX = /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]+)/
const RUMBLE_REGEX = /(?:https?:\/\/)?rumble\.com\/embed\/([a-zA-Z0-9_-]+)/

/**
 * Extracts video provider and ID from a URL
 */
function parseVideoUrl(url: string): { provider: 'youtube' | 'rumble'; videoId: string } | null {
  let match = url.match(YOUTUBE_REGEX)
  if (match) {
    return { provider: 'youtube', videoId: match[1] }
  }

  match = url.match(YOUTUBE_SHORT_REGEX)
  if (match) {
    return { provider: 'youtube', videoId: match[1] }
  }

  match = url.match(RUMBLE_REGEX)
  if (match) {
    return { provider: 'rumble', videoId: match[1] }
  }

  return null
}

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

  addStorage() {
    return {
      markdown: {
        serialize(state: { write: (text: string) => void }, node: { attrs: { provider: string; videoId: string } }) {
          const { provider, videoId } = node.attrs
          const url =
            provider === 'youtube'
              ? `https://www.youtube.com/watch?v=${videoId}`
              : `https://rumble.com/embed/${videoId}`
          // Write as markdown autolink
          state.write(`<${url}>`)
        },
        parse: {
          // Parsing is handled by preprocessVideoLinks
        },
      },
    }
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

    const src =
      provider === 'youtube'
        ? `https://www.youtube-nocookie.com/embed/${videoId}`
        : `https://rumble.com/embed/${videoId}`

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

  const src =
    provider === 'youtube'
      ? `https://www.youtube-nocookie.com/embed/${videoId}`
      : `https://rumble.com/embed/${videoId}`

  return (
    <NodeViewWrapper>
      <div className='video-embed-wrapper' contentEditable={false}>
        <iframe
          src={src}
          allowFullScreen
          allow='fullscreen; picture-in-picture'
          className='video-embed'
          frameBorder='0'
        />
      </div>
    </NodeViewWrapper>
  )
}
