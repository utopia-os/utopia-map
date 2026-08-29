/* eslint-disable camelcase -- `maps_id` is the Directus junction field name */
import { describe, expect, it } from 'vitest'

import { applyMapLabelOverrides } from './layerLabels'

const MAP = 'map-de'
const OTHER_MAP = 'map-en'

const layer = (maps: unknown) => ({ name: 'Gärten', menuText: 'Garten eintragen', maps })

describe('applyMapLabelOverrides', () => {
  it('uses the override belonging to the requested map', () => {
    const [result] = applyMapLabelOverrides(
      [
        layer([
          { maps_id: OTHER_MAP, name: 'Gardens', menuText: 'add a garden' },
          { maps_id: MAP, name: null, menuText: null },
        ]),
      ],
      OTHER_MAP,
    )

    expect(result.name).toBe('Gardens')
    expect(result.menuText).toBe('add a garden')
  })

  it('falls back to the layer label when the override is empty', () => {
    const [result] = applyMapLabelOverrides(
      [layer([{ maps_id: MAP, name: null, menuText: '   ' }])],
      MAP,
    )

    expect(result.name).toBe('Gärten')
    expect(result.menuText).toBe('Garten eintragen')
  })

  it('overrides each label independently', () => {
    const [result] = applyMapLabelOverrides(
      [layer([{ maps_id: MAP, name: 'Gemeinschaftsgärten', menuText: null }])],
      MAP,
    )

    expect(result.name).toBe('Gemeinschaftsgärten')
    expect(result.menuText).toBe('Garten eintragen')
  })

  it('accepts an expanded maps_id object', () => {
    const [result] = applyMapLabelOverrides(
      [layer([{ maps_id: { id: MAP }, name: 'Gemeinschaftsgärten' }])],
      MAP,
    )

    expect(result.name).toBe('Gemeinschaftsgärten')
  })

  it('ignores junction rows of other maps and dangling rows', () => {
    const [result] = applyMapLabelOverrides(
      [
        layer([
          { maps_id: null, name: 'Waise' },
          { maps_id: OTHER_MAP, name: 'Gardens' },
        ]),
      ],
      MAP,
    )

    expect(result.name).toBe('Gärten')
  })

  it('leaves layers untouched when the junction is not expanded', () => {
    const input = layer([701, 702])
    const [result] = applyMapLabelOverrides([input], MAP)

    expect(result).toBe(input)
  })
})
