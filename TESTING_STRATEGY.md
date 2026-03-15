# Teststrategie für TipTap Markdown-Migration

## Zusammenfassung der Analyse

Die TipTap-Migration umfasst folgende Kernkomponenten:

| Komponente | Beschreibung | Komplexität |
|------------|--------------|-------------|
| `lib/src/Components/TipTap/utils/preprocessMarkdown.ts` | 6-stufige Preprocessing-Pipeline | Hoch |
| `lib/src/Components/TipTap/utils/simpleMarkdownToHtml.tsx` | Statische HTML-Konvertierung | Mittel |
| `lib/src/Components/TipTap/extensions/Hashtag.tsx` | Custom Extension mit Tokenizer | Mittel |
| `lib/src/Components/TipTap/extensions/ItemMention.tsx` | Custom Extension mit Tokenizer | Mittel |
| `lib/src/Components/TipTap/extensions/VideoEmbed.tsx` | Block-Element für Videos | Mittel |
| `lib/src/Components/Input/RichTextEditor.tsx` | Haupt-Editor-Komponente | Hoch |
| `lib/src/Components/Map/Subcomponents/ItemPopupComponents/TextView.tsx` | Read-Only Editor | Mittel |
| `lib/src/Components/Map/Subcomponents/ItemPopupComponents/TextViewStatic.tsx` | Lightweight Static Renderer | Niedrig |

---

## Empfohlene Teststrategie: Testing Pyramid

```
                    ┌─────────────────┐
                    │   E2E Tests     │  ← Wenige, kritische User Journeys
                    │   (Cypress)     │
                    └────────┬────────┘
                             │
                    ┌────────┴────────┐
                    │  Integration    │  ← TipTap + Extensions zusammen
                    │  Tests (Vitest) │
                    └────────┬────────┘
                             │
         ┌───────────────────┴───────────────────┐
         │           Unit Tests (Vitest)          │  ← Utility-Funktionen isoliert
         │  preprocessMarkdown, simpleMarkdownToHtml  │
         └────────────────────────────────────────┘
```

### Begründung der Strategie

1. **Unit Tests für Utility-Funktionen (Hauptfokus)**
   - `preprocessMarkdown.ts` und `simpleMarkdownToHtml.tsx` sind **pure Funktionen** ohne Abhängigkeiten
   - Extrem schnelle Ausführung, hohe Coverage möglich
   - Einfach zu warten und zu debuggen
   - Hier liegt die meiste **Geschäftslogik** der Markdown-Verarbeitung

2. **Integration Tests für TipTap Extensions**
   - Extensions benötigen einen Editor-Kontext
   - Testen der Markdown ↔ JSON ↔ HTML Roundtrips
   - Mäßiger Aufwand, gute Fehlererkennung

3. **E2E Tests nur für kritische User Journeys**
   - Hoher Wartungsaufwand
   - Langsame Ausführung
   - Für Smoke Tests und Regressionsschutz

---

## Detaillierte Testfälle

### 1. Unit Tests für `preprocessMarkdown.ts`

#### A) `convertNakedUrls`

| Testfall | Input | Expected Output |
|----------|-------|-----------------|
| **Happy Path** | `Check https://example.com out` | `Check [example.com](https://example.com) out` |
| **www entfernen** | `https://www.example.com` | `[example.com](https://example.com)` |
| **URL in Markdown-Link (Skip)** | `[link](https://example.com)` | Unverändert |
| **URL in Autolink (Skip)** | `<https://example.com>` | Unverändert |
| **Mehrere URLs** | `https://a.com and https://b.com` | Beide konvertiert |
| **URL am Satzende mit Punkt** | `Visit https://example.com.` | Punkt nicht Teil der URL |
| **URL mit Klammern** | `(https://example.com)` | Klammern korrekt behandelt |
| **URL mit Query-Params** | `https://example.com?a=1&b=2` | Vollständig konvertiert |

#### B) `preprocessVideoLinks`

| Testfall | Input | Expected Output |
|----------|-------|-----------------|
| **YouTube Standard** | `<https://www.youtube.com/watch?v=abc123>` | `<video-embed provider="youtube" video-id="abc123">` |
| **YouTube Short URL** | `<https://youtu.be/abc123>` | Korrekt konvertiert |
| **YouTube Markdown Link** | `[Video](https://youtube.com/watch?v=abc123)` | Korrekt konvertiert |
| **Rumble Embed** | `<https://rumble.com/embed/xyz789>` | `<video-embed provider="rumble"...>` |
| **URL mit Extra-Params** | `<https://youtube.com/watch?v=abc&t=120>` | Nur Video-ID extrahiert |
| **Kein Video-Link** | `<https://example.com>` | Unverändert |
| **Gemischter Content** | `Text <https://youtu.be/x> more` | Nur Video konvertiert |

#### C) `preprocessHashtags`

| Testfall | Input | Expected Output |
|----------|-------|-----------------|
| **Einfacher Hashtag** | `Hello #world` | `Hello <span data-hashtag...>#world</span>` |
| **Hashtag mit Umlauten** | `#München` | Korrekt erkannt |
| **Hashtag mit Zahlen** | `#test123` | Korrekt erkannt |
| **Hashtag in Link (Skip)** | `[#tag](#anchor)` | Unverändert |
| **Hashtag nach Klammer (Skip)** | `(#section)` | Unverändert |
| **Mehrere Hashtags** | `#one #two #three` | Alle konvertiert |
| **Ungültiger Hashtag** | `#` | Unverändert (kein Text) |
| **Hashtag mit Underscore** | `#my_tag` | Korrekt erkannt |

#### D) `preprocessItemMentions`

| Testfall | Input | Expected Output |
|----------|-------|-----------------|
| **Standard Format** | `[@Person](/item/uuid-123)` | `<span data-item-mention...>@Person</span>` |
| **Mit Layer (Legacy)** | `[@Name](/item/layer/uuid)` | Korrekt konvertiert |
| **Relativer Pfad** | `[@Name](item/uuid)` | Korrekt konvertiert |
| **Mehrere Mentions** | `[@A](/item/1) und [@B](/item/2)` | Beide konvertiert |
| **Kein Item-Link** | `[@Name](/other/path)` | Unverändert |
| **UUID Case-Insensitive** | `[@Name](/item/ABC-def-123)` | Korrekt erkannt |
| **Label mit Sonderzeichen** | `[@Max Müller](/item/uuid)` | Korrekt konvertiert |

#### E) `truncateMarkdown`

| Testfall | Input | Limit | Expected |
|----------|-------|-------|----------|
| **Unter Limit** | `Short text` | 100 | Unverändert |
| **Über Limit (Plain)** | `A very long text...` | 10 | `A very lo...` |
| **Hashtag nicht schneiden** | `Text #verylonghashtag more` | 15 | Vollständiger Hashtag oder davor abschneiden |
| **Mention nicht schneiden** | `Hi [@Person](/item/x) bye` | 10 | Vollständige Mention oder davor |
| **Link nicht schneiden** | `See [link](url) more` | 8 | Vollständiger Link oder davor |
| **Newlines nicht zählen** | `Line1\n\nLine2` | 10 | Newlines ignoriert bei Zählung |
| **Gemischter Content** | `#tag [@m](/item/1) text` | 20 | Tokens atomar |

#### F) `removeMarkdownSyntax`

| Testfall | Input | Expected |
|----------|-------|----------|
| **Bold** | `**bold**` | `bold` |
| **Italic** | `*italic*` | `italic` |
| **Headers** | `# Heading` | `Heading` |
| **Links** | `[text](url)` | `text` |
| **Item Mentions erhalten** | `[@Name](/item/x)` | Erhalten |
| **Bilder entfernen** | `![alt](img.png)` | Leer |
| **Code** | `` `code` `` | `code` |

---

### 2. Unit Tests für `simpleMarkdownToHtml.tsx`

| Testfall | Input | Expected HTML |
|----------|-------|---------------|
| **Bold** | `**bold**` | `<strong>bold</strong>` |
| **Italic** | `*italic*` | `<em>italic</em>` |
| **Link** | `[text](url)` | `<a href="url">text</a>` |
| **External Link** | `[text](https://ext.com)` | `<a href="..." target="_blank"...>` |
| **Header H1** | `# Title` | `<h1>Title</h1>` |
| **Header H2-H6** | `## ... ######` | Entsprechende h-Tags |
| **Inline Code** | `` `code` `` | `<code>code</code>` |
| **Blockquote** | `> quote` | `<blockquote>quote</blockquote>` |
| **Video Embed** | `<video-embed provider="youtube"...>` | `<iframe src="youtube-nocookie...">` |
| **Hashtag mit Farbe** | Preprocessed Hashtag + Tag mit color | Style mit korrekter Farbe |
| **Item Mention** | Preprocessed Mention + Item | Link mit korrekter Farbe |
| **XSS Prevention** | `<script>alert('xss')</script>` | Escaped, kein Script-Tag |
| **Newlines** | `Line1\n\nLine2` | `</p><p>` Trennung |

---

### 3. Integration Tests für TipTap Extensions

Diese Tests benötigen einen TipTap Editor-Kontext. Setup via `@tiptap/core`:

```typescript
// Test-Setup Beispiel
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { Markdown } from '@tiptap/markdown'
import { Hashtag } from './Hashtag'
```

#### A) Hashtag Extension

| Testfall | Beschreibung |
|----------|--------------|
| **Markdown → JSON** | `#tag` wird zu `{ type: 'hashtag', attrs: { label: 'tag' } }` |
| **JSON → Markdown** | Hashtag-Node wird zu `#tag` serialisiert |
| **HTML Parse** | `<span data-hashtag data-label="x">#x</span>` wird erkannt |
| **HTML Render** | Node rendert korrekte HTML-Struktur |
| **Tokenizer Start** | `/(?<!\[)#[a-zA-Z]/` matched korrekt |
| **Click Handler (read-only)** | `onTagClick` wird aufgerufen |
| **No Click (editable)** | Kein Click-Handler im Edit-Modus |

#### B) ItemMention Extension

| Testfall | Beschreibung |
|----------|--------------|
| **Markdown → JSON** | `[@Name](/item/uuid)` wird zu korrektem Node |
| **JSON → Markdown** | Node wird korrekt serialisiert |
| **Mit Layer** | Legacy-Format wird korrekt geparst |
| **UUID Case-Insensitive** | Groß-/Kleinschreibung egal |
| **Farbe aus Item** | `getItemColor` wird korrekt verwendet |

#### C) VideoEmbed Extension

| Testfall | Beschreibung |
|----------|--------------|
| **YouTube Parse** | Autolink zu Video-Node |
| **Rumble Parse** | Embed-URL zu Video-Node |
| **Iframe Render** | Korrekter `youtube-nocookie.com` Embed |
| **Paste Handler** | Video-URL wird beim Einfügen erkannt |

#### D) Roundtrip Tests

| Testfall | Flow |
|----------|------|
| **Markdown Roundtrip** | Markdown → Editor → `getMarkdown()` → identisch |
| **Komplexer Content** | Text + #tag + @mention + Video → Roundtrip |
| **Preserve Formatting** | Bold, Italic, Listen bleiben erhalten |

---

### 4. Component Tests (React Testing Library)

#### RichTextEditor

| Testfall | Beschreibung |
|----------|--------------|
| **Render mit Default** | Editor rendert mit initialem Content |
| **onChange Callback** | `updateFormValue` erhält Markdown |
| **Placeholder** | Placeholder wird angezeigt |
| **Hashtag Suggestion** | `#` triggert Suggestion Popup |
| **Item Mention Suggestion** | `@` triggert Suggestion Popup |
| **Keyboard Navigation** | Arrow Keys in Suggestions |
| **Suggestion Select** | Enter fügt Tag ein |

#### TextView

| Testfall | Beschreibung |
|----------|--------------|
| **Read-Only** | Editor ist nicht editierbar |
| **Truncation** | Langer Text wird gekürzt + `...` |
| **Hashtag Click** | `addFilterTag` wird aufgerufen |
| **Internal Link** | React Router Navigation |
| **External Link** | Neuer Tab |

#### TextViewStatic

| Testfall | Beschreibung |
|----------|--------------|
| **HTML Render** | Markdown wird zu HTML |
| **Hashtag Farbe** | Farbe aus Tags-Array |
| **Item Mention Link** | Korrekter `/item/` Link |
| **Video Embed** | Iframe wird gerendert |

---

### 5. E2E Tests (Cypress)

Nur **kritische User Journeys** - minimaler Scope für maximale Stabilität:

#### A) Editor Flow

```typescript
describe('Rich Text Editor', () => {
  it('should create and save content with hashtags and mentions', () => {
    // 1. Neues Item erstellen
    // 2. Text eingeben mit #tag und @mention
    // 3. Speichern
    // 4. Popup öffnen und Rendering prüfen
  })

  it('should handle video embeds', () => {
    // YouTube URL einfügen → Video-Embed sichtbar
  })
})
```

#### B) Display Flow

```typescript
describe('Text Display', () => {
  it('should render hashtags clickable in popup', () => {
    // Item mit Hashtag öffnen
    // Hashtag klicken
    // Filter wird aktiviert
  })

  it('should navigate to mentioned items', () => {
    // Item mit @mention öffnen
    // Mention klicken
    // Navigation zum verlinkten Item
  })
})
```

---

## Priorisierung der Implementierung

### Phase 1: Unit Tests (Höchste Priorität)

| Datei | Geschätzte Tests | Grund |
|-------|------------------|-------|
| `preprocessMarkdown.spec.ts` | ~40 Tests | Pure Functions, schnell, hohe Coverage |
| `simpleMarkdownToHtml.spec.ts` | ~25 Tests | Pure Function, XSS-kritisch |

### Phase 2: Integration Tests

| Datei | Geschätzte Tests | Grund |
|-------|------------------|-------|
| `Hashtag.spec.ts` | ~15 Tests | Custom Extension mit Tokenizer |
| `ItemMention.spec.ts` | ~15 Tests | Custom Extension mit Tokenizer |
| `VideoEmbed.spec.ts` | ~10 Tests | Block-Element |

### Phase 3: Component Tests

| Datei | Geschätzte Tests | Grund |
|-------|------------------|-------|
| `RichTextEditor.spec.tsx` | ~15 Tests | Haupt-Editor |
| `TextView.spec.tsx` | ~10 Tests | Read-Only Variante |
| `TextViewStatic.spec.tsx` | ~8 Tests | Lightweight Renderer |

### Phase 4: E2E Tests (Niedrigste Priorität)

| Datei | Geschätzte Tests | Grund |
|-------|------------------|-------|
| `editor-flow.cy.ts` | 3-5 Tests | Kritische User Journey |

---

## Edge Cases und Error Handling

### Besonders wichtige Grenzfälle

1. **Leerer Input** - Alle Funktionen sollten mit `''`, `null`, `undefined` umgehen
2. **Sehr langer Text** - Performance bei >10.000 Zeichen
3. **Verschachtelte Syntax** - `**#bold-hashtag**`, `[[@mention](/item/x)](url)`
4. **Unicode** - Emojis, RTL-Text, Sonderzeichen
5. **Malformed Markdown** - Ungeschlossene Tags: `**bold`, `[link(`
6. **XSS Vectors** - `<script>`, Event-Handler in Links
7. **Concurrent Tokens** - `#tag1#tag2` (ohne Leerzeichen)
8. **URLs in Code-Blöcken** - Sollten nicht konvertiert werden

---

## Test-Setup Empfehlungen

### Vitest Setup erweitern (`lib/setupTest.ts`)

```typescript
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// TipTap DOM-Mocks für Vitest (basierend auf Community-Empfehlungen)
Range.prototype.getBoundingClientRect = () => ({
  bottom: 0, height: 0, left: 0, right: 0, top: 0, width: 0, x: 0, y: 0,
  toJSON: vi.fn(),
})
Range.prototype.getClientRects = () => ({
  item: () => null, length: 0, [Symbol.iterator]: vi.fn(),
})
Document.prototype.elementFromPoint = vi.fn()
```

---

## Fazit

Die empfohlene Strategie fokussiert auf **Unit Tests für die Markdown-Utility-Funktionen**, da hier:
- Die meiste Geschäftslogik liegt
- Pure Functions einfach testbar sind
- Hohe Coverage mit geringem Aufwand erreichbar ist

E2E Tests sollten auf ein Minimum beschränkt bleiben und nur kritische User Journeys abdecken. Dies folgt der Testing Pyramid Best Practice und sorgt für:
- **Schnelles Feedback** (Unit Tests <1s)
- **Hohe Wartbarkeit** (keine flaky UI-Tests)
- **Gute Fehlerlokalisierung** (isolierte Tests)

---

## Quellen

- [TipTap Testing Discussion #4008](https://github.com/ueberdosis/tiptap/discussions/4008)
- [TipTap Jest Issue #5108](https://github.com/ueberdosis/tiptap/issues/5108)
- [Testing TipTap CodeSandbox](https://codesandbox.io/s/testing-tiptap-p0oomz)
- [TipTap Contributing Guide](https://tiptap.dev/docs/resources/contributing)
