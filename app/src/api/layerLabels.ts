/**
 * A row of the `layers_maps` junction, which represents "this layer, on this map".
 * `name` and `menuText` are optional per-map overrides: when a layer is shared
 * between maps, each map can label it in its own language.
 */
interface LayerMapAssignment {
  maps_id?: string | { id?: string } | null
  name?: string | null
  menuText?: string | null
}

const assignedMapId = (assignment: LayerMapAssignment): string | undefined =>
  typeof assignment.maps_id === 'string'
    ? assignment.maps_id
    : (assignment.maps_id?.id ?? undefined)

/** Treats null, undefined and blank strings alike, so an emptied field falls back. */
const override = (value: string | null | undefined, fallback: string): string =>
  typeof value === 'string' && value.trim() !== '' ? value : fallback

const isAssignment = (candidate: unknown): candidate is LayerMapAssignment =>
  typeof candidate === 'object' && candidate !== null

/**
 * Applies the per-map label overrides stored on the `layers_maps` junction.
 * Layers without an override for `mapId` are returned untouched, so maps that
 * never set one keep the labels defined on the layer itself.
 */
export function applyMapLabelOverrides<
  T extends { name?: string; menuText?: string; maps?: unknown },
>(layers: T[], mapId: string): T[] {
  return layers.map((layer) => {
    const assignments = Array.isArray(layer.maps) ? layer.maps : []
    const assignment = assignments
      .filter(isAssignment)
      .find((candidate) => assignedMapId(candidate) === mapId)

    if (!assignment) return layer

    return {
      ...layer,
      name: override(assignment.name, layer.name ?? ''),
      menuText: override(assignment.menuText, layer.menuText ?? ''),
    }
  })
}
