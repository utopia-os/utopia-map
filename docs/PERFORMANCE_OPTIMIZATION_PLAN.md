# Performance-Optimierungsplan für Utopia Map

## Zusammenfassung der Analyse

Die Performance-Analyse hat drei Hauptbereiche mit Optimierungspotenzial identifiziert:

1. **React Component Re-Renders** - Unnötige Re-Renders durch Context-Architektur
2. **Map/Leaflet Performance** - Marker-Rendering und Clustering-Konfiguration
3. **Animations/Transitions** - CSS-Optimierungen für flüssigere Übergänge

---

## Kritische Probleme (Höchste Priorität)

### 1. MarkerClusterGroup Konfiguration
**Datei:** `lib/src/Components/Map/UtopiaMapInner.tsx:329-337`

```tsx
// PROBLEM: Alle Marker bleiben im DOM, auch wenn off-screen
removeOutsideVisibleBounds={false}
```

**Fix:** `removeOutsideVisibleBounds={true}` setzen

### 2. Marker ohne Memoization
**Datei:** `lib/src/Components/Item/PopupView.tsx:95-183`

- Alle Marker werden bei jedem State-Change neu gerendert
- Inline Event-Handler erstellen neue Funktionen pro Marker
- `MarkerIconFactory` wird für jeden Marker bei jedem Render aufgerufen

**Fix:**
- Marker-Komponente mit `React.memo` wrappen
- Event-Handler mit `useCallback` memoizen
- Icon-Erstellung mit `useMemo` cachen

### 3. Item-Mutation während Render
**Datei:** `lib/src/Components/Item/PopupView.tsx:98-106`

```tsx
// PROBLEM: Direkte Mutation des Item-Objekts
item.text += '\n\n'
item.tags.map((tag) => {
  item.text += `#${encodeTag(tag)}`
})
```

**Fix:** Immutable Kopie erstellen oder Berechnung in useMemo verschieben

---

## Hohe Priorität

### 4. Context Provider Nesting
**Datei:** `lib/src/Components/AppShell/ContextWrapper.tsx:55-94`

10 verschachtelte Context-Provider verursachen Kaskaden-Re-Renders.

**Fix:**
- AppState in separate Contexts aufteilen (UI-State, Theme, Assets)
- `useMemo` für Context-Values verwenden

### 5. getItemTags O(n) Suche
**Datei:** `lib/src/Components/Map/hooks/useTags.tsx:92-118`

Lineare Suche für jeden Tag-Match bei jedem Item.

**Fix:** Map/Set für O(1) Lookups verwenden

### 6. ProfileForm teure Effect-Berechnung
**Datei:** `lib/src/Components/Profile/ProfileForm.tsx:93-143`

- Mehrere O(n) Array-Suchen
- Effect läuft bei jeder Items/Tags Änderung

**Fix:** `useMemo` für berechnete Werte

---

## Mittlere Priorität

### 7. SetAppState - 4 separate Effects
**Datei:** `lib/src/Components/AppShell/SetAppState.tsx:20-34`

4 separate Effects statt einem gebatchten Update.

**Fix:** Zu einem Effect zusammenfassen

### 8. Fehlende React.memo
- `HeaderView` - `lib/src/Components/Map/Subcomponents/ItemPopupComponents/HeaderView/index.tsx`
- `RelationCard` - `lib/src/Components/Profile/Subcomponents/RelationCard.tsx`
- `ItemViewPopup` - `lib/src/Components/Map/Subcomponents/ItemViewPopup.tsx`
- `FlexView` Template-Komponenten - `lib/src/Components/Profile/Templates/FlexView.tsx`

### 9. GalleryView ohne useMemo
**Datei:** `lib/src/Components/Profile/Subcomponents/GalleryView.tsx:22-39`

Images-Array wird bei jedem Render neu berechnet.

---

## Animation Optimierungen

### 10. Zu lange Transition-Zeiten
**Datei:** `app/src/App.css:18-21`

```css
/* PROBLEM: 1000ms ist zu langsam */
.transition-fade {
  transition: opacity 1000ms ease;
}
```

**Fix:** Auf 300-400ms reduzieren

### 11. Margin statt Transform für Sidebar
**Dateien:**
- `lib/src/Components/AppShell/SideBar.tsx`
- `lib/src/Components/AppShell/Content.tsx`

```tsx
// PROBLEM: Margin-Transitions verursachen Layout-Reflows
tw:ml-48 tw:transition-all

// BESSER: GPU-beschleunigte Transforms
tw:translate-x-48 tw:transition-transform
```

### 12. Modal Animation Konflikte
**Datei:** `lib/src/Components/Gaming/Modal.tsx:23-24`

`tw:transition-none` auf modal-box überschreibt Container-Transition.

### 13. DialogModal DOM-Manipulation
**Datei:** `lib/src/Components/Templates/DialogModal.tsx`

Direkte style/classList Manipulation verursacht Layout-Thrashing.

---

## Empfohlene Implementierungsreihenfolge

### Phase 1: Quick Wins (Sofort umsetzbar)
1. `removeOutsideVisibleBounds={true}` setzen
2. App.css Transition von 1000ms auf 300ms reduzieren
3. SetAppState Effects zusammenfassen

### Phase 2: Memoization (Mittlerer Aufwand)
4. Marker-Komponente mit React.memo wrappen
5. MarkerIconFactory Ergebnisse cachen
6. HeaderView, RelationCard, ItemViewPopup mit React.memo
7. GalleryView images mit useMemo

### Phase 3: Architektur (Höherer Aufwand)
8. getItemTags auf Map-basierte Lookups umstellen
9. ProfileForm Berechnungen optimieren
10. Item-Mutation in PopupView beheben

### Phase 4: CSS/Animation
11. Sidebar Margin → Transform Migration
12. Modal Animation Konflikte beheben
13. will-change Hints hinzufügen

---

## Erwartete Verbesserungen

- **30-50% weniger Re-Renders** durch Memoization
- **Flüssigere Map-Interaktion** durch Marker-Optimierungen
- **Schnellere Übergänge** durch kürzere Transition-Zeiten
- **Weniger Layout-Thrashing** durch Transform statt Margin

---

## Kritische Dateien

| Datei | Änderungen |
|-------|------------|
| `UtopiaMapInner.tsx` | Cluster-Config, Event-Handler |
| `PopupView.tsx` | Marker-Memoization, Item-Mutation |
| `useTags.tsx` | Map-basierte Lookups |
| `ProfileForm.tsx` | useMemo für Berechnungen |
| `SetAppState.tsx` | Effects zusammenfassen |
| `App.css` | Transition-Zeiten |
| `SideBar.tsx` / `Content.tsx` | Transform statt Margin |

---

## Messstrategie & Erfolgsmetriken

### Baseline-Messung (vor Optimierungen)

#### 1. React DevTools Profiler
```bash
# Chrome Extension: React Developer Tools
# Profiler Tab → Record → Interaktionen durchführen → Stop
```

**Zu messende Szenarien:**
- [ ] Map laden mit 100+ Markern → Render-Zeit notieren
- [ ] Filter-Tag hinzufügen/entfernen → Re-Render-Count
- [ ] Sidebar öffnen/schließen → Render-Zeit
- [ ] Item-Popup öffnen → Zeit bis vollständig gerendert
- [ ] Zwischen Items navigieren → Transition-Smoothness

**Metriken:**
| Szenario | Baseline | Nach Phase 1 | Nach Phase 2 | Ziel |
|----------|----------|--------------|--------------|------|
| Initial Map Render | ___ ms | ___ ms | ___ ms | <500ms |
| Marker Re-Renders | ___ count | ___ count | ___ count | <10 |
| Tag Filter Toggle | ___ ms | ___ ms | ___ ms | <100ms |
| Sidebar Toggle | ___ ms | ___ ms | ___ ms | <50ms |
| Popup Open | ___ ms | ___ ms | ___ ms | <200ms |

#### 2. Chrome DevTools Performance Panel
```
F12 → Performance Tab → Record → Interaktionen → Stop
```

**Zu messen:**
- **FPS während Animationen** (Ziel: konstant 60 FPS)
- **Long Tasks** (>50ms) identifizieren
- **Layout Shifts** bei Sidebar/Modal
- **Scripting vs Rendering Zeit**

#### 3. Lighthouse Performance Score
```bash
# Chrome DevTools → Lighthouse → Performance
```

**Metriken:**
| Metrik | Baseline | Ziel |
|--------|----------|------|
| Performance Score | ___ | >90 |
| First Contentful Paint | ___ s | <1.5s |
| Largest Contentful Paint | ___ s | <2.5s |
| Total Blocking Time | ___ ms | <200ms |
| Cumulative Layout Shift | ___ | <0.1 |

#### 4. Custom Performance Markers (Optional)
```tsx
// Kann in kritischen Komponenten eingefügt werden:
useEffect(() => {
  performance.mark('PopupView-render-start')
  return () => {
    performance.mark('PopupView-render-end')
    performance.measure('PopupView-render',
      'PopupView-render-start',
      'PopupView-render-end')
    console.log(performance.getEntriesByName('PopupView-render'))
  }
}, [])
```

### Testszenarien für Vergleich

#### Szenario A: Große Datenmenge
1. Map mit 200+ Items laden
2. 3 Filter-Tags aktivieren
3. Zwischen 5 Items navigieren
4. Sidebar 3x öffnen/schließen

#### Szenario B: Schnelle Interaktionen
1. Rapid Tag-Toggle (5x schnell hintereinander)
2. Item-Popup öffnen → schließen → nächstes öffnen
3. Sidebar während Map-Pan öffnen

#### Szenario C: Animation Smoothness
1. Sidebar-Animation beobachten (ruckelt?)
2. Modal öffnen/schließen
3. Zwischen Profile-Views wechseln

### Erfolgs-Kriterien

| Phase | Erfolgskriterium |
|-------|------------------|
| Phase 1 (Quick Wins) | Lighthouse Score +10 Punkte, keine sichtbaren Ruckler bei Sidebar |
| Phase 2 (Memoization) | Re-Render Count -50%, Marker-Interaktion <100ms |
| Phase 3 (Architektur) | Initial Load <500ms bei 200 Items |
| Phase 4 (CSS) | Konstant 60 FPS bei allen Animationen |

### Automatisierte Performance-Tests mit Vitest

#### Setup

Neue Datei: `lib/src/__tests__/performance.bench.ts`

```typescript
import { describe, bench, expect } from 'vitest'
import { render } from '@testing-library/react'
import { performance } from 'perf_hooks'

// Utility für Performance-Messung
const measureRender = async (Component: React.FC, props: any) => {
  const start = performance.now()
  const { unmount } = render(<Component {...props} />)
  const end = performance.now()
  unmount()
  return end - start
}

describe('Performance Benchmarks', () => {

  // Marker Rendering
  bench('render 100 markers', async () => {
    const items = generateMockItems(100)
    await measureRender(PopupView, { items })
  }, { time: 1000 })

  bench('render 500 markers', async () => {
    const items = generateMockItems(500)
    await measureRender(PopupView, { items })
  }, { time: 2000 })

  // Tag Filter Performance
  bench('filter toggle with 100 items', async () => {
    // Simuliert Tag-Filter Toggle
  })

  // Sidebar Animation
  bench('sidebar open/close cycle', async () => {
    // Misst Sidebar-Toggle
  })

  // ProfileForm Rendering
  bench('ProfileForm with complex item', async () => {
    const item = generateComplexItem()
    await measureRender(ProfileForm, { item })
  })
})
```

#### Vitest Config Erweiterung

```typescript
// vitest.config.ts - benchmark mode hinzufügen
export default defineConfig({
  test: {
    benchmark: {
      include: ['**/*.bench.ts'],
      reporters: ['default', 'json'],
      outputFile: './benchmark-results.json',
    },
  },
})
```

#### NPM Script

```json
// package.json
{
  "scripts": {
    "test:perf": "vitest bench",
    "test:perf:baseline": "vitest bench --outputFile=baseline.json",
    "test:perf:compare": "vitest bench --compare=baseline.json"
  }
}
```

#### Performance-Grenzwerte

```typescript
// lib/src/__tests__/performance.thresholds.ts
export const PERF_THRESHOLDS = {
  MARKER_RENDER_100: 500,    // ms
  MARKER_RENDER_500: 2000,   // ms
  TAG_FILTER_TOGGLE: 100,    // ms
  SIDEBAR_TOGGLE: 50,        // ms
  POPUP_OPEN: 200,           // ms
  PROFILE_RENDER: 300,       // ms
}

// In Tests verwenden:
expect(renderTime).toBeLessThan(PERF_THRESHOLDS.MARKER_RENDER_100)
```

#### CI Integration (Optional)

```yaml
# .github/workflows/performance.yml
name: Performance Benchmarks

on:
  pull_request:
    branches: [main]

jobs:
  benchmark:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run test:perf
      - name: Compare with baseline
        run: npm run test:perf:compare
```

### Dokumentation der Messungen

Vor jeder Phase:
1. Baseline-Werte in Tabelle eintragen
2. Screenshots von DevTools Profiler speichern
3. Lighthouse Report als PDF exportieren

Nach jeder Phase:
1. Neue Werte eintragen
2. Vergleich dokumentieren
3. Bei Regression: Ursache analysieren
