/// <reference types="cypress" />
import { mount } from 'cypress/react'

import { TestEditorWithRouter } from './TestEditor'

import type { Editor } from '@tiptap/core'

describe('VideoEmbed Extension', () => {
  describe('YouTube Video Parsing', () => {
    it('parses YouTube standard URL autolink to video embed', () => {
      const content = '<https://www.youtube.com/watch?v=dQw4w9WgXcQ>'

      mount(<TestEditorWithRouter content={content} />)

      // Should render as iframe, not as text
      cy.get('iframe.video-embed').should('exist')
      cy.get('iframe.video-embed')
        .should('have.attr', 'src')
        .and('include', 'youtube-nocookie.com/embed/dQw4w9WgXcQ')
    })

    it('parses YouTube short URL autolink to video embed', () => {
      const content = '<https://youtu.be/dQw4w9WgXcQ>'

      mount(<TestEditorWithRouter content={content} />)

      cy.get('iframe.video-embed').should('exist')
      cy.get('iframe.video-embed')
        .should('have.attr', 'src')
        .and('include', 'youtube-nocookie.com/embed/dQw4w9WgXcQ')
    })

    it('handles YouTube URL with extra parameters', () => {
      const content = '<https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=120>'

      mount(<TestEditorWithRouter content={content} />)

      cy.get('iframe.video-embed').should('exist')
      cy.get('iframe.video-embed').should('have.attr', 'src').and('include', 'dQw4w9WgXcQ')
    })
  })

  describe('Rumble Video Parsing', () => {
    it('parses Rumble embed URL autolink to video embed', () => {
      const content = '<https://rumble.com/embed/v1abc23>'

      mount(<TestEditorWithRouter content={content} />)

      cy.get('iframe.video-embed').should('exist')
      cy.get('iframe.video-embed')
        .should('have.attr', 'src')
        .and('include', 'rumble.com/embed/v1abc23')
    })
  })

  describe('Multiple Videos', () => {
    it('renders multiple video embeds correctly', () => {
      const content = `<https://youtu.be/video1234567>

<https://youtu.be/video7654321>`

      mount(<TestEditorWithRouter content={content} />)

      cy.get('iframe.video-embed').should('have.length', 2)
    })
  })

  describe('Markdown Serialization (Roundtrip)', () => {
    it('serializes video embed back to autolink markdown', () => {
      const content = '<https://www.youtube.com/watch?v=dQw4w9WgXcQ>'
      let editorInstance: Editor

      mount(
        <TestEditorWithRouter
          content={content}
          onReady={(editor) => {
            editorInstance = editor
          }}
        />,
      )

      cy.get('iframe.video-embed')
        .should('exist')
        .then(() => {
          const markdown = editorInstance.getMarkdown()
          expect(markdown).to.include('<https://www.youtube.com/watch?v=dQw4w9WgXcQ>')
          return null
        })
    })
  })

  describe('Non-Video URLs', () => {
    it('does not convert regular URLs to video embeds', () => {
      const content = '<https://example.com>'

      mount(<TestEditorWithRouter content={content} />)

      cy.get('iframe.video-embed').should('not.exist')
      // Should render as a link instead
      cy.get('a').should('contain.text', 'example.com')
    })

    it('does not convert non-embed Rumble URLs', () => {
      // Regular Rumble video page, not embed URL
      const content = '<https://rumble.com/v1abc23-some-video.html>'

      mount(<TestEditorWithRouter content={content} />)

      cy.get('iframe.video-embed').should('not.exist')
    })
  })

  describe('Video Embed Attributes', () => {
    it('renders with correct iframe attributes', () => {
      const content = '<https://youtu.be/dQw4w9WgXcQ>'

      mount(<TestEditorWithRouter content={content} />)

      cy.get('iframe.video-embed').should('have.attr', 'allowfullscreen').and('exist')
      cy.get('iframe.video-embed').should('have.attr', 'allow').and('include', 'fullscreen')
    })

    it('wraps video in container div', () => {
      const content = '<https://youtu.be/dQw4w9WgXcQ>'

      mount(<TestEditorWithRouter content={content} />)

      cy.get('.video-embed-wrapper').should('exist')
      cy.get('.video-embed-wrapper').find('iframe.video-embed').should('exist')
    })
  })

  describe('Adding Video Below Existing Video', () => {
    it('user clicks after video and presses Enter - first video should remain', () => {
      const content = '<https://youtu.be/dQw4w9WgXcQ>'

      mount(<TestEditorWithRouter content={content} editable={true} />)

      cy.get('iframe.video-embed').should('exist')
      cy.get('.ProseMirror').click()
      cy.get('.ProseMirror').type('{enter}')

      cy.get('iframe.video-embed').should('exist')
      cy.get('iframe.video-embed').should('have.attr', 'src').and('include', 'dQw4w9WgXcQ')
    })

    it('user clicks after video and types some text - first video should remain', () => {
      const content = '<https://youtu.be/dQw4w9WgXcQ>'

      mount(<TestEditorWithRouter content={content} editable={true} />)

      cy.get('iframe.video-embed').should('exist')
      cy.get('.ProseMirror').click()
      cy.get('.ProseMirror').type('{enter}Some text after the video')

      cy.get('iframe.video-embed').should('exist')
      cy.get('iframe.video-embed').should('have.attr', 'src').and('include', 'dQw4w9WgXcQ')
    })

    it('user pastes a URL directly after video (no Enter) - first video should remain', () => {
      const content = '<https://youtu.be/dQw4w9WgXcQ>'

      mount(<TestEditorWithRouter content={content} editable={true} />)

      cy.get('iframe.video-embed').should('exist')
      cy.get('.ProseMirror').click()
      cy.get('.ProseMirror').trigger('paste', {
        clipboardData: {
          getData: () => 'https://www.youtube.com/watch?v=abc123xyz99',
        },
      })

      cy.get('iframe.video-embed').should('exist')
      cy.get('iframe.video-embed').first().should('have.attr', 'src').and('include', 'dQw4w9WgXcQ')
    })

    it('user presses Enter then pastes a URL - first video should remain', () => {
      const content = '<https://youtu.be/dQw4w9WgXcQ>'

      mount(<TestEditorWithRouter content={content} editable={true} />)

      cy.get('iframe.video-embed').should('exist')
      cy.get('.ProseMirror').click()
      cy.get('.ProseMirror').type('{enter}')

      cy.get('iframe.video-embed').should('exist')

      cy.get('.ProseMirror').trigger('paste', {
        clipboardData: {
          getData: () => 'https://www.youtube.com/watch?v=abc123xyz99',
        },
      })

      cy.get('iframe.video-embed').should('exist')
      cy.get('iframe.video-embed').first().should('have.attr', 'src').and('include', 'dQw4w9WgXcQ')
    })

    it('preserves first video when setting content with two videos', () => {
      const content = '<https://youtu.be/dQw4w9WgXcQ>'
      let editorInstance: Editor | undefined

      mount(
        <TestEditorWithRouter
          content={content}
          editable={true}
          onReady={(editor) => {
            editorInstance = editor
          }}
        />,
      )

      cy.get('iframe.video-embed')
        .should('exist')
        .should(() => expect(editorInstance).to.exist)
        .then(() => {
          if (!editorInstance) return null
          const newContent = `<https://youtu.be/dQw4w9WgXcQ>

<https://youtu.be/second12345>`
          editorInstance.commands.setContent(newContent, { contentType: 'markdown' })
          return null
        })

      cy.get('iframe.video-embed').should('have.length', 2)
    })

    it('verifies markdown roundtrip with two videos', () => {
      const content = `<https://youtu.be/dQw4w9WgXcQ>

<https://youtu.be/second12345>`
      let editorInstance: Editor | undefined

      mount(
        <TestEditorWithRouter
          content={content}
          editable={true}
          onReady={(editor) => {
            editorInstance = editor
          }}
        />,
      )

      cy.get('iframe.video-embed')
        .should('have.length', 2)
        .should(() => expect(editorInstance).to.exist)
        .then(() => {
          if (!editorInstance) return null
          const markdown = editorInstance.getMarkdown()
          expect(markdown).to.include('dQw4w9WgXcQ')
          expect(markdown).to.include('second12345')
          return null
        })
    })

    it('handles keyboard navigation: Arrow down from video creates new paragraph', () => {
      const content = '<https://youtu.be/dQw4w9WgXcQ>'
      let editorInstance: Editor | undefined

      mount(
        <TestEditorWithRouter
          content={content}
          editable={true}
          onReady={(editor) => {
            editorInstance = editor
          }}
        />,
      )

      cy.get('iframe.video-embed')
        .should('exist')
        .should(() => expect(editorInstance).to.exist)
        .then(() => {
          if (!editorInstance) return null
          editorInstance.commands.focus('end')
          editorInstance
            .chain()
            .insertContentAt(editorInstance.state.doc.content.size, {
              type: 'paragraph',
            })
            .run()
          editorInstance.commands.setVideoEmbed({ provider: 'youtube', videoId: 'newvideo1234' })
          return null
        })

      cy.get('iframe.video-embed').should('have.length', 2)
    })
  })
})
