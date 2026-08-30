// eslint-disable-next-line import-x/no-unassigned-import
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// TipTap requires Range and Document APIs that happy-dom doesn't fully implement
Range.prototype.getBoundingClientRect = () => ({
  bottom: 0,
  height: 0,
  left: 0,
  right: 0,
  top: 0,
  width: 0,
  x: 0,
  y: 0,
  toJSON: vi.fn(),
})

Range.prototype.getClientRects = () => ({
  item: () => null,
  length: 0,
  [Symbol.iterator]: vi.fn(),
})

if (typeof Document.prototype.elementFromPoint === 'undefined') {
  Document.prototype.elementFromPoint = vi.fn()
}
