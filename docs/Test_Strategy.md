# TipTap Migration Testing Strategy

## Overview

This document outlines the comprehensive testing strategy for the TipTap Markdown migration. The strategy uses a combination of **Vitest** for pure function unit tests and **Cypress Component Testing** for TipTap-dependent components, leveraging the project's existing test infrastructure.

---

## Component Overview

The TipTap migration includes the following core components:

| Component | Description | Test Tool |
|-----------|-------------|-----------|
| `lib/src/Components/TipTap/utils/preprocessMarkdown.ts` | 6-stage preprocessing pipeline | Vitest |
| `lib/src/Components/TipTap/utils/simpleMarkdownToHtml.tsx` | Static HTML conversion | Vitest |
| `lib/src/Components/TipTap/extensions/Hashtag.tsx` | Custom extension with tokenizer | Cypress Component |
| `lib/src/Components/TipTap/extensions/ItemMention.tsx` | Custom extension with tokenizer | Cypress Component |
| `lib/src/Components/TipTap/extensions/VideoEmbed.tsx` | Block element for videos | Cypress Component |
| `lib/src/Components/Input/RichTextEditor.tsx` | Main editor component | Cypress Component |
| `lib/src/Components/Map/Subcomponents/ItemPopupComponents/TextView.tsx` | Read-only editor | Cypress Component |
| `lib/src/Components/Map/Subcomponents/ItemPopupComponents/TextViewStatic.tsx` | Lightweight static renderer | Vitest |
| `lib/src/Utils/ReplaceURLs.ts` | URL/email processing utilities | Vitest |

---

## Testing Pyramid Architecture

```
                         ┌─────────────────────┐
                         │     E2E Tests       │  3-5 critical user journeys
                         │   (Cypress E2E)     │
                         └──────────┬──────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │   Cypress Component Tests     │  TipTap extensions + editors
                    │   Real browser, no mocking    │  Contract tests
                    └───────────────┬───────────────┘
                                    │
         ┌──────────────────────────┴──────────────────────────┐
         │                    Vitest Unit Tests                 │
         │     preprocessMarkdown, simpleMarkdownToHtml         │
         │         Pure functions, security tests               │
         └──────────────────────────────────────────────────────┘
```

### Rationale

1. **Vitest Unit Tests for Pure Functions (Primary Focus)**
   - `preprocessMarkdown.ts` and `simpleMarkdownToHtml.tsx` are **pure functions** without DOM dependencies
   - Extremely fast execution, high coverage achievable
   - Easy to maintain and debug
   - Contains most of the **business logic** for markdown processing
   - Includes **security/XSS tests** for HTML output

2. **Cypress Component Tests for TipTap Extensions**
   - TipTap requires a **real browser environment** (jsdom mocking is fragile and incomplete)
   - The project already has Cypress Component Testing configured (`lib/cypress.config.ts`)
   - Real browser provides native support for `Range`, `Selection`, `ResizeObserver`, etc.
   - Test Markdown ↔ JSON ↔ HTML roundtrips with actual TipTap editor
   - **Contract tests** verify preprocessing output is valid TipTap input

3. **E2E Tests Only for Critical User Journeys**
   - Uses existing Cypress E2E setup (`cypress/`)
   - Leverages existing custom commands (`cy.clickMarker()`, `cy.waitForPopup()`)
   - For smoke tests and regression protection

---

## Component Usage Context

Understanding where each component is used guides test priority:

| Context | Component | Rendering | Priority |
|---------|-----------|-----------|----------|
| **Map Popup** | `TextViewStatic` | `simpleMarkdownToHtml` (static HTML) | P0 - most visible |
| **Item Card** | `TextViewStatic` | `simpleMarkdownToHtml` (static HTML) | P0 - list views |
| **Item Profile** | `TextView` | TipTap editor (read-only) | P1 - detail view |
| **Item Edit Form** | `RichTextEditor` | TipTap editor (editable) | P0 - data integrity |

---

## Test Setup

### Vitest Configuration (`lib/setupTest.ts`)

For **pure function unit tests**, no TipTap-specific mocks are needed:

```typescript
import '@testing-library/jest-dom'
```

> **Note:** TipTap editor tests use Cypress Component Testing instead of Vitest to avoid fragile jsdom mocks. This provides a real browser environment where `Range`, `Selection`, `ResizeObserver`, and other DOM APIs work natively.

### Cypress Component Testing (`lib/cypress.config.ts`)

Already configured in the project:

```typescript
import { defineConfig } from 'cypress'

export default defineConfig({
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    specPattern: ['**/**/*.cy.{ts,tsx}'],
  },
})
```

### Running Tests

```bash
# Vitest unit tests
cd lib && npm run test:unit

# Cypress component tests (interactive)
cd lib && npx cypress open --component

# Cypress component tests (headless)
cd lib && npx cypress run --component

# Cypress E2E tests
cd cypress && npm test
```

---

## Detailed Test Cases

### 1. Unit Tests: `preprocessMarkdown.ts`

#### A) `convertNakedUrls` (internal function)

| Category | Test Case | Input | Expected Output |
|----------|-----------|-------|-----------------|
| **Happy Path** | Basic URL | `"Check https://example.com out"` | `"Check [example.com](https://example.com) out"` |
| **Happy Path** | Remove www | `"https://www.example.com"` | `"[example.com](https://example.com)"` |
| **Happy Path** | Multiple URLs | `"https://a.com and https://b.com"` | Both converted |
| **Happy Path** | URL with query params | `"https://example.com?a=1&b=2"` | Full URL preserved in link |
| **Skip** | URL in markdown link | `"[link](https://example.com)"` | Unchanged |
| **Skip** | URL in autolink | `"<https://example.com>"` | Unchanged |
| **Edge** | URL at sentence end | `"Visit https://example.com."` | Dot NOT part of URL |
| **Edge** | URL in parentheses | `"(https://example.com)"` | Parentheses handled correctly |
| **Edge** | URL at line start | `"https://example.com is good"` | Converted correctly |

#### B) `preprocessVideoLinks`

| Category | Test Case | Input | Expected Output |
|----------|-----------|-------|-----------------|
| **Happy Path** | YouTube standard | `"<https://www.youtube.com/watch?v=abc123def45>"` | `<video-embed provider="youtube" video-id="abc123def45">` |
| **Happy Path** | YouTube short | `"<https://youtu.be/abc123def45>"` | Same as above |
| **Happy Path** | YouTube markdown link | `"[Video](https://youtube.com/watch?v=abc123def45)"` | Converted |
| **Happy Path** | Rumble embed | `"<https://rumble.com/embed/v1abc>"` | `<video-embed provider="rumble"...>` |
| **Edge** | Extra params | `"<https://youtube.com/watch?v=abc&t=120>"` | Only video-id extracted |
| **Edge** | Non-video link | `"<https://example.com>"` | Unchanged |
| **Edge** | Mixed content | `"Text <https://youtu.be/x> more"` | Only video converted |
| **Error** | Invalid video ID | `"[V](https://youtube.com/watch?v=)"` | Unchanged (no match) |

#### C) `preprocessHashtags`

| Category | Test Case | Input | Expected Output |
|----------|-----------|-------|-----------------|
| **Happy Path** | Simple hashtag | `"Hello #world"` | `"Hello <span data-hashtag data-label=\"world\">#world</span>"` |
| **Happy Path** | Multiple hashtags | `"#one #two #three"` | All converted |
| **Happy Path** | With numbers | `"#test123"` | Converted |
| **Happy Path** | With underscore | `"#my_tag"` | Converted |
| **Happy Path** | Unicode (umlauts) | `"#München"` | `data-label="München"` |
| **Happy Path** | Unicode (accents) | `"#café"` | Converted |
| **Skip** | Hashtag in link text | `"[#tag](#anchor)"` | Unchanged |
| **Skip** | Hashtag in link URL | `"[section](#section)"` | Unchanged |
| **Edge** | Concurrent hashtags | `"#tag1#tag2"` | Only `#tag1` converted (no space) |
| **Edge** | Hashtag only `#` | `"Just #"` | Unchanged |
| **Edge** | Hashtag with hyphen | `"#my-tag"` | Converted |

#### D) `preprocessItemMentions`

| Category | Test Case | Input | Expected Output |
|----------|-----------|-------|-----------------|
| **Happy Path** | Standard format | `"[@Alice](/item/abc-123)"` | `<span data-item-mention data-label="Alice" data-id="abc-123">@Alice</span>` |
| **Happy Path** | With layer (legacy) | `"[@Bob](/item/people/def-456)"` | `data-id="def-456"` extracted |
| **Happy Path** | Relative path | `"[@Name](item/uuid)"` | Converted |
| **Happy Path** | Multiple mentions | `"[@A](/item/1) and [@B](/item/2)"` | Both converted |
| **Happy Path** | UUID case-insensitive | `"[@Name](/item/ABC-DEF-123)"` | Converted |
| **Happy Path** | Label with spaces | `"[@Max Müller](/item/uuid)"` | Converted |
| **Skip** | Non-item link | `"[@Name](/other/path)"` | Unchanged |
| **Skip** | Regular link | `"[Name](/item/123)"` | Unchanged (no @) |

#### E) `truncateMarkdown`

| Category | Test Case | Input | Limit | Expected |
|----------|-----------|-------|-------|----------|
| **Happy Path** | Under limit | `"Short text"` | 100 | Unchanged |
| **Happy Path** | At limit | `"A".repeat(150)` | 100 | `"A".repeat(100) + "..."` |
| **Atomic** | Preserve hashtag | `"A".repeat(95) + " #tag"` | 100 | Complete `#tag` or cut before |
| **Atomic** | Preserve mention | `"A".repeat(90) + " [@X](/item/1)"` | 100 | Complete mention or cut before |
| **Atomic** | Preserve link | `"See [link](url) more"` | 8 | Complete link or cut before |
| **Edge** | Newlines don't count | `"Line1\n\nLine2"` | 10 | Newlines not counted |
| **Edge** | Empty text | `""` | 100 | `""` |
| **Edge** | Limit 0 | `"Text"` | 0 | `"..."` |
| **Error** | Negative limit | `"Text"` | -1 | No throw |

#### F) `removeMarkdownSyntax`

| Category | Test Case | Input | Expected |
|----------|-----------|-------|----------|
| **Happy Path** | Bold | `"**bold**"` | `"bold"` |
| **Happy Path** | Italic | `"*italic*"` | `"italic"` |
| **Happy Path** | Headers | `"# Heading"` | `"Heading"` |
| **Happy Path** | Links | `"[text](url)"` | `"text"` |
| **Happy Path** | Images | `"![alt](img.png)"` | `""` |
| **Happy Path** | Inline code | `` "`code`" `` | `"code"` |
| **Preserve** | Item mentions | `"[@Name](/item/x)"` | Preserved (contains @) |
| **Preserve** | Hashtags | `"#tag"` | Preserved |

#### G) Full Pipeline `preprocessMarkdown`

| Category | Test Case | Input | Expected Behavior |
|----------|-----------|-------|-------------------|
| **Happy Path** | Complete content | `"Check https://x.com #tag [@A](/item/1)"` | All transformations applied |
| **Edge** | Empty string | `""` | Returns `""` |
| **Edge** | Null input | `null` | Returns `""` (no throw) |
| **Edge** | Undefined input | `undefined` | Returns `""` (no throw) |
| **Edge** | Only whitespace | `"   "` | Whitespace preserved |
| **Edge** | Very long text | `"A".repeat(10000)` | Completes without timeout |
| **Error** | Malformed markdown | `"[unclosed link"` | No throw |
| **Error** | Malformed URL | `"http:/broken"` | No throw |

---

### 2. Unit Tests: `simpleMarkdownToHtml.tsx`

| Category | Test Case | Input | Expected HTML |
|----------|-----------|-------|---------------|
| **Happy Path** | Bold | `"**bold**"` | `<strong>bold</strong>` |
| **Happy Path** | Italic | `"*italic*"` | `<em>italic</em>` |
| **Happy Path** | Inline code | `` "`code`" `` | `<code>code</code>` |
| **Happy Path** | External link | `"[text](https://x.com)"` | `<a href="..." target="_blank" rel="noopener noreferrer">` |
| **Happy Path** | Internal link | `"[profile](/profile)"` | `<a href="/profile">` (no target) |
| **Happy Path** | Headers H1-H6 | `"# Title"` ... `"###### Sub"` | Corresponding h1-h6 tags |
| **Happy Path** | Blockquote | `"> quote"` | `<blockquote>quote</blockquote>` |
| **Happy Path** | Paragraph break | `"Para1\n\nPara2"` | `</p><p>` |
| **Happy Path** | Line break | `"Line1\nLine2"` | `<br>` |
| **Happy Path** | Video embed | `<video-embed provider="youtube" video-id="abc">` | `<iframe src="...youtube-nocookie.com/embed/abc"` |
| **Happy Path** | Hashtag with color | Preprocessed hashtag + tag with `color: #ff0000` | `style="color: #ff0000"` |
| **Happy Path** | Item mention | Preprocessed mention + item in list | `<a href="/item/..." class="item-mention"` |
| **Edge** | Empty string | `""` | `""` |
| **Edge** | Unknown tag | Hashtag for unknown tag | `color: inherit` |
| **Edge** | Unknown item | Mention for unknown item | Fallback color |
| **Edge** | Consecutive newlines | `"\n\n\n\n"` | No excessive empty elements |
| **Security** | XSS script tag | `"<script>alert(1)</script>"` | `&lt;script&gt;` escaped |
| **Security** | XSS event handler | `"<img onerror=alert(1)>"` | Escaped |
| **Security** | Already escaped | `"&amp;"` | Preserved correctly |

---

### 3. Unit Tests: Dependency Functions (`ReplaceURLs.ts`)

The preprocessing pipeline depends on `fixUrls` and `mailRegex` from `lib/src/Utils/ReplaceURLs.ts`. These must be tested:

#### A) `fixUrls`

| Category | Test Case | Input | Expected Output |
|----------|-----------|-------|-----------------|
| **Happy Path** | Add https to naked domain | `"Visit example.com today"` | `"Visit https://example.com today"` |
| **Happy Path** | Preserve existing https | `"https://example.com"` | Unchanged |
| **Happy Path** | Preserve existing http | `"http://example.com"` | Unchanged |
| **Happy Path** | Multiple domains | `"a.com and b.org"` | Both get https:// |
| **Edge** | Domain with path | `"example.com/page"` | `"https://example.com/page"` |
| **Edge** | Domain with subdomain | `"sub.example.com"` | `"https://sub.example.com"` |
| **Skip** | Inside markdown link | `"[link](example.com)"` | Behavior depends on implementation |

#### B) `mailRegex`

| Category | Test Case | Input | Should Match |
|----------|-----------|-------|--------------|
| **Happy Path** | Simple email | `"test@example.com"` | ✓ |
| **Happy Path** | With subdomain | `"user@mail.example.com"` | ✓ |
| **Happy Path** | With plus | `"user+tag@example.com"` | ✓ |
| **Happy Path** | With dots | `"first.last@example.com"` | ✓ |
| **Happy Path** | Country TLD | `"user@example.co.uk"` | ✓ |
| **Edge** | Invalid - no @ | `"not-an-email"` | ✗ |
| **Edge** | Invalid - no domain | `"user@"` | ✗ |
| **Edge** | Invalid - no local | `"@example.com"` | ✗ |

---

### 4. Unit Tests: XSS Security (`xss.spec.ts`)

**Critical:** The `simpleMarkdownToHtml` function uses a tag restoration pattern that could be vulnerable to XSS. A dedicated security test suite is required.

#### XSS Attack Vectors

```typescript
const XSS_VECTORS = [
  // Basic XSS
  '<script>alert(1)</script>',
  '<img src=x onerror=alert(1)>',
  '<svg onload=alert(1)>',
  '<body onload=alert(1)>',

  // URL-based XSS
  '[click](javascript:alert(1))',
  '[click](data:text/html,<script>alert(1)</script>)',
  '[click](vbscript:alert(1))',

  // Tag restoration bypass attempts
  '&lt;span data-hashtag onclick=alert(1)',
  '&lt;video-embed onload=alert(1)',
  '<span data-hashtag data-label="x" onclick="alert(1)">#x</span>',

  // Attribute injection
  '#tag" onclick="alert(1)',
  '[@Name" onclick="alert(1)](/item/123)',

  // Unicode/encoding escapes
  '\\u003cscript\\u003ealert(1)\\u003c/script\\u003e',
  '%3Cscript%3Ealert(1)%3C/script%3E',
]
```

| Category | Test Case | Verification |
|----------|-----------|--------------|
| **Script Tags** | `<script>alert(1)</script>` | No `<script` in output |
| **Event Handlers** | `onerror=`, `onload=`, `onclick=` | No `on*=` in output |
| **JavaScript URLs** | `javascript:alert(1)` | No `javascript:` in href |
| **Data URLs** | `data:text/html,...` | No `data:` in href |
| **Tag Restoration Bypass** | `&lt;span data-hashtag onclick=` | No `onclick` in output |
| **Attribute Injection** | `#tag" onclick="alert(1)` | Quotes properly escaped |

---

### 5. Cypress Component Tests: TipTap Extensions

> **Note:** TipTap extension tests use **Cypress Component Testing** instead of Vitest to leverage a real browser environment. This eliminates the need for fragile jsdom mocks.

#### Test Wrapper Pattern

```typescript
/// <reference types="cypress" />
import { mount } from 'cypress/react'
import { EditorContent, useEditor } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { Markdown } from '@tiptap/markdown'
import { Hashtag } from './Hashtag'

interface TestEditorProps {
  content: string
  tags?: { name: string; color: string }[]
  onTagClick?: (tag: any) => void
  editable?: boolean
}

function TestEditor({ content, tags = [], onTagClick, editable = false }: TestEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown,
      Hashtag.configure({ tags, onTagClick }),
    ],
    content,
    contentType: 'markdown',
    editable,
  })
  return <EditorContent editor={editor} />
}
```

#### A) Hashtag Extension

| Category | Test Case | Verification |
|----------|-----------|--------------|
| **Parse** | Markdown → JSON | `"#tag"` → `{ type: 'hashtag', attrs: { label: 'tag' } }` |
| **Serialize** | JSON → Markdown | Hashtag node → `"#tag"` |
| **HTML Parse** | `<span data-hashtag data-label="x">#x</span>` | Recognized as hashtag node |
| **HTML Render** | Node → HTML | Contains `data-hashtag`, `class="hashtag"` |
| **Tokenizer** | Start hint | `/(?<!\[)#[a-zA-Z]/` matches correctly |
| **Behavior** | Click in view mode | `onTagClick` callback fired |
| **Behavior** | Click in edit mode | No callback fired |
| **Styling** | Known tag | Applies tag color |
| **Styling** | Unknown tag | Uses `inherit` |

#### B) ItemMention Extension

| Category | Test Case | Verification |
|----------|-----------|--------------|
| **Parse** | Markdown → JSON | `"[@Name](/item/uuid)"` → correct node |
| **Parse** | With layer path | `"[@Name](/item/layer/uuid)"` → extracts uuid |
| **Parse** | Case-insensitive UUID | `"[@X](/item/ABC-DEF)"` → works |
| **Serialize** | JSON → Markdown | Node → `"[@Name](/item/uuid)"` |
| **Styling** | Known item | Uses `getItemColor()` |
| **Styling** | Unknown item | Uses `var(--color-primary)` |
| **Behavior** | Click in view mode | Navigates to `/item/{id}` |
| **Behavior** | Click in edit mode | No navigation |

#### C) VideoEmbed Extension

| Category | Test Case | Verification |
|----------|-----------|--------------|
| **Parse** | YouTube autolink | `"<https://youtube.com/watch?v=abc>"` → videoEmbed node |
| **Parse** | YouTube short | `"<https://youtu.be/abc>"` → videoEmbed node |
| **Parse** | Rumble | `"<https://rumble.com/embed/xyz>"` → videoEmbed node |
| **Serialize** | YouTube node → Markdown | `"<https://www.youtube.com/watch?v=abc>"` |
| **Render** | YouTube | iframe with `youtube-nocookie.com` |
| **Render** | Rumble | iframe with `rumble.com/embed/` |
| **Paste** | Paste YouTube URL | Video embed node inserted |
| **Paste** | Paste non-video URL | Normal text paste |

#### D) Roundtrip Tests (Critical)

| Test Case | Flow |
|-----------|------|
| **Simple text** | Markdown → Editor → `getMarkdown()` → identical |
| **With hashtag** | `"Hello #world"` → roundtrip → identical |
| **With mention** | `"Thanks [@Alice](/item/123)"` → roundtrip → identical |
| **With video** | `"<https://youtu.be/abc>"` → roundtrip → identical |
| **Complex** | Text + hashtag + mention + video → roundtrip → identical |
| **Formatting** | Bold, italic, lists → roundtrip → preserved |

#### E) Contract Tests (Critical)

Contract tests verify that the **output of `preprocessMarkdown()` is valid input for TipTap**. These catch integration failures that unit tests miss.

```typescript
// lib/src/Components/TipTap/__tests__/contracts.cy.tsx
/// <reference types="cypress" />
import { mount } from 'cypress/react'
import { EditorContent, useEditor } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { Markdown } from '@tiptap/markdown'
import { Hashtag, ItemMention, VideoEmbed } from '../extensions'
import { preprocessMarkdown } from '../utils/preprocessMarkdown'

function ContractTestEditor({ rawContent }: { rawContent: string }) {
  const preprocessed = preprocessMarkdown(rawContent)
  const editor = useEditor({
    extensions: [StarterKit, Markdown, Hashtag.configure({ tags: [] }), ItemMention, VideoEmbed],
    content: preprocessed,
  })
  return <EditorContent editor={editor} data-testid="editor" />
}

describe('Preprocessing → TipTap Contract', () => {
  it('preprocessed hashtag renders correctly', () => {
    mount(<ContractTestEditor rawContent="#nature" />)
    cy.get('.hashtag').should('contain', '#nature')
  })

  it('preprocessed mention renders correctly', () => {
    mount(<ContractTestEditor rawContent="[@Alice](/item/123-abc)" />)
    cy.get('.item-mention').should('contain', '@Alice')
  })

  it('preprocessed video renders as iframe', () => {
    mount(<ContractTestEditor rawContent="<https://youtu.be/abc123>" />)
    cy.get('iframe').should('have.attr', 'src').and('include', 'youtube-nocookie.com')
  })

  it('complex content renders all elements', () => {
    mount(<ContractTestEditor rawContent="Hello #world with [@Bob](/item/456) and <https://youtu.be/xyz>" />)
    cy.get('.hashtag').should('exist')
    cy.get('.item-mention').should('exist')
    cy.get('iframe').should('exist')
  })
})
```

| Test Case | Verification |
|-----------|--------------|
| **Hashtag contract** | Preprocessed `#tag` → TipTap renders `.hashtag` element |
| **Mention contract** | Preprocessed `[@Name](/item/id)` → TipTap renders `.item-mention` |
| **Video contract** | Preprocessed `<https://youtu.be/x>` → TipTap renders `iframe` |
| **Complex contract** | All three together render correctly |
| **Empty content** | Empty string doesn't crash |
| **Malformed content** | Unclosed markdown doesn't crash |

---

### 6. Cypress Component Tests: Editor Components

#### RichTextEditor (`RichTextEditor.cy.tsx`)

| Category | Test Case | Verification |
|----------|-----------|--------------|
| **Render** | With default value | Editor displays content |
| **Callback** | Type text | `updateFormValue` receives markdown |
| **Placeholder** | Empty editor | Placeholder visible |
| **Suggestion** | Type `#` | Hashtag suggestion popup appears |
| **Suggestion** | Type `@` | Item mention suggestion popup appears |
| **Keyboard** | Arrow keys in suggestions | Navigation works |
| **Keyboard** | Enter in suggestions | Item selected |
| **Keyboard** | Escape | Popup closes |
| **New tag** | Select "Create #newTag" | `addTag` called, node inserted |

#### TextView (`TextView.cy.tsx`)

| Category | Test Case | Verification |
|----------|-----------|--------------|
| **Render** | With text | TipTap editor in read-only mode |
| **Empty** | `text=""` | Returns `null` |
| **Null** | `text=null` | Returns `null` |
| **Undefined** | `text=undefined` | Shows login prompt |
| **Truncation** | `truncate=true` | Text ends with `...` |
| **Hashtag** | Click hashtag | `addFilterTag` called |
| **Link** | Click internal link | React Router navigation |
| **Link** | Click external link | Opens new tab |

---

### 7. Vitest Component Tests: Static Renderer

#### TextViewStatic (`TextViewStatic.spec.ts`)

> **Note:** `TextViewStatic` does not use TipTap - it renders HTML directly via `simpleMarkdownToHtml`. Therefore it uses **Vitest** instead of Cypress Component Testing.

| Category | Test Case | Verification |
|----------|-----------|--------------|
| **Render** | With text | HTML rendered via `dangerouslySetInnerHTML` |
| **Empty** | `text=""` | Returns `null` |
| **Undefined** | `text=undefined` | Shows login prompt |
| **Truncation** | `truncate=true` | Truncated to ~100 chars |
| **Hashtag** | Click hashtag | `addFilterTag` called |
| **Hashtag** | Color applied | Tag color from tags array |
| **Mention** | Rendered as link | `<a href="/item/...">` |
| **Video** | Rendered as iframe | YouTube nocookie embed |
| **Security** | XSS vectors | All escaped (see XSS test suite) |

---

### 8. E2E Tests (Minimal - Critical Journeys Only)

```typescript
// cypress/e2e/tiptap/rich-text.cy.ts

describe('Rich Text Editor - Critical Flows', () => {
  beforeEach(() => {
    cy.login()
    cy.visit('/')
    cy.waitForMapReady()
  })

  it('creates item with hashtags and mentions, verifies rendering', () => {
    // 1. Create new item
    cy.get('[data-cy="create-item-button"]').click()

    // 2. Enter rich content
    cy.get('.ProseMirror').type('Project about #nature with [@Alice]')
    cy.get('[data-cy="suggestion-list"]').contains('Alice').click()

    // 3. Save
    cy.get('[data-cy="save-button"]').click()
    cy.wait('@saveItem')

    // 4. Verify popup rendering
    cy.get('[data-cy="item-popup"]').should('be.visible')
    cy.get('.hashtag').should('contain', '#nature')
    cy.get('.item-mention').should('contain', '@Alice')
  })

  it('embeds video from pasted URL', () => {
    cy.get('[data-cy="create-item-button"]').click()
    cy.get('.ProseMirror').type('Check this: ')

    // Paste video URL
    cy.get('.ProseMirror').invoke('val', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
      .trigger('paste')

    cy.get('.video-embed-wrapper iframe').should('be.visible')
  })

  it('filters by hashtag when clicked in popup', () => {
    // Navigate to item with hashtag
    cy.clickMarker()
    cy.waitForPopup()

    // Click hashtag
    cy.get('.hashtag').first().click()

    // Verify filter applied
    cy.get('[data-cy="active-filters"]').should('be.visible')
  })

  it('navigates to mentioned item when clicked', () => {
    // Navigate to item with mention
    cy.clickMarker()
    cy.waitForPopup()

    // Click mention
    cy.get('.item-mention').first().click()

    // Verify navigation
    cy.url().should('include', '/item/')
  })

  it('preserves markdown through edit-save cycle', () => {
    // Create item with formatting
    cy.get('[data-cy="create-item-button"]').click()
    cy.get('.ProseMirror').type('**Bold** and *italic* with #tag')
    cy.get('[data-cy="save-button"]').click()

    // Edit item
    cy.get('[data-cy="edit-button"]').click()

    // Verify markdown preserved
    cy.get('.ProseMirror strong').should('contain', 'Bold')
    cy.get('.ProseMirror em').should('contain', 'italic')
    cy.get('.ProseMirror .hashtag').should('contain', '#tag')
  })
})
```

---

## Edge Cases & Error Handling

### Critical Edge Cases

All functions should handle these edge cases gracefully:

1. **Empty/Null Input** - `''`, `null`, `undefined` should not throw
2. **Very Long Text** - Performance check with 10,000+ characters
3. **Nested Syntax** - `**#bold-hashtag**`, `*[@mention](/item/x)*`
4. **Concurrent Tokens** - `#tag1#tag2` (no space between)
5. **Unicode** - Emojis 🎉, RTL text, umlauts (München), accents (café)
6. **Malformed Markdown** - Unclosed tags: `**bold`, `[link(`
7. **URLs in Code Blocks** - Should NOT be converted
8. **XSS Vectors** - `<script>`, event handlers in links, `javascript:` URLs
9. **Special Characters** - `<`, `>`, `&`, `"`, `'` in content must be escaped

---

## Implementation Plan

### Phase 1: Vitest Unit Tests - Highest Priority

| File | Test Count | Purpose |
|------|------------|---------|
| `preprocessMarkdown.spec.ts` | ~45 tests | Pure function preprocessing pipeline |
| `simpleMarkdownToHtml.spec.ts` | ~25 tests | HTML conversion, basic security |
| `xss.spec.ts` | ~15 tests | Comprehensive XSS attack vectors |
| `ReplaceURLs.spec.ts` | ~10 tests | Dependency functions (fixUrls, mailRegex) |

**Deliverable:** Core transformation logic + security fully covered

### Phase 2: Cypress Component Tests - TipTap Extensions

| File | Test Count | Purpose |
|------|------------|---------|
| `Hashtag.cy.tsx` | ~12 tests | Parse, style, behavior |
| `ItemMention.cy.tsx` | ~12 tests | Parse, style, behavior |
| `VideoEmbed.cy.tsx` | ~8 tests | Parse, render |
| `contracts.cy.tsx` | ~6 tests | Preprocessing → TipTap integration |

**Deliverable:** All TipTap extensions verified in real browser

### Phase 3: Component Tests - Editors

| File | Tool | Test Count | Purpose |
|------|------|------------|---------|
| `RichTextEditor.cy.tsx` | Cypress | ~10 tests | Full editor with suggestions |
| `TextView.cy.tsx` | Cypress | ~6 tests | Read-only TipTap |
| `TextViewStatic.spec.ts` | Vitest | ~12 tests | Static HTML renderer (no TipTap) |

**Deliverable:** All render paths tested

### Phase 4: E2E Tests - Lowest Priority

| File | Test Count | Purpose |
|------|------------|---------|
| `rich-text.cy.ts` | 5 tests | Critical user journeys |

**Deliverable:** End-to-end user flows verified

---

## File Structure

```
lib/src/Components/TipTap/
├── utils/
│   ├── preprocessMarkdown.ts
│   ├── preprocessMarkdown.spec.ts       # Vitest - pure functions
│   ├── simpleMarkdownToHtml.tsx
│   ├── simpleMarkdownToHtml.spec.ts     # Vitest - pure functions
│   └── xss.spec.ts                      # Vitest - security tests
├── extensions/
│   ├── Hashtag.tsx
│   ├── Hashtag.cy.tsx                   # Cypress Component
│   ├── ItemMention.tsx
│   ├── ItemMention.cy.tsx               # Cypress Component
│   ├── VideoEmbed.tsx
│   └── VideoEmbed.cy.tsx                # Cypress Component
└── __tests__/
    └── contracts.cy.tsx                 # Cypress Component - contract tests

lib/src/Components/Input/
├── RichTextEditor.tsx
└── RichTextEditor.cy.tsx                # Cypress Component

lib/src/Components/Map/Subcomponents/ItemPopupComponents/
├── TextView.tsx
├── TextView.cy.tsx                      # Cypress Component
├── TextViewStatic.tsx
└── TextViewStatic.spec.ts               # Vitest - no TipTap dependency

lib/src/Utils/
└── ReplaceURLs.spec.ts                  # Vitest - dependency tests

cypress/e2e/tiptap/
└── rich-text.cy.ts                      # Cypress E2E
```

---

## Summary

### Test Distribution

| Test Type | Tool | Test Count | Coverage Target |
|-----------|------|------------|-----------------|
| **Vitest Unit Tests** | Vitest | ~95 | >90% for utility functions |
| **Cypress Component Tests** | Cypress | ~54 | >80% for TipTap components |
| **Vitest Component Tests** | Vitest | ~12 | >80% for TextViewStatic |
| **E2E Tests** | Cypress | 5 | Critical paths only |

### Key Principles

1. **Pure functions in Vitest** - `preprocessMarkdown` and `simpleMarkdownToHtml` are fast, isolated tests
2. **TipTap components in Cypress** - Real browser avoids fragile jsdom mocks
3. **Contract tests are critical** - Verify preprocessing output works with TipTap
4. **Roundtrip tests are critical** - Markdown → Editor → Markdown must be lossless
5. **Minimal E2E** - Only critical user journeys to avoid flaky tests
6. **XSS prevention** - Dedicated security test suite is mandatory

### Benefits of This Strategy

- **Fast Feedback** - Vitest unit tests execute in <1 second
- **Reliable TipTap Tests** - Cypress Component uses real browser (no mocking)
- **High Maintainability** - Clear separation between Vitest and Cypress responsibilities
- **Good Error Localization** - Isolated tests pinpoint failures
- **Security Coverage** - Dedicated XSS test suite catches vulnerabilities

---

## References

- [Cypress Component Testing](https://docs.cypress.io/guides/component-testing/overview)
- [TipTap Testing Discussion #4008](https://github.com/ueberdosis/tiptap/discussions/4008)
- [TipTap Jest Issue #5108](https://github.com/ueberdosis/tiptap/issues/5108)
- [TipTap Markdown Extension Docs](https://tiptap.dev/docs/extensions/extensions/markdown)
