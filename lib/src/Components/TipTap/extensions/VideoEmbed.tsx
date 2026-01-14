import { mergeAttributes, Node } from '@tiptap/core'

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
})
