/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable no-console */
import { readItems } from '@directus/sdk'

import { directusClient } from './directus'
import { applyMapLabelOverrides } from './layerLabels'

import type { LayerProps } from 'utopia-ui'

export class layersApi {
  mapId: string

  constructor(mapId: string) {
    this.mapId = mapId
  }

  async getItems() {
    try {
      const layers = (await directusClient.request(
        readItems('layers' as any, {
          fields: [
            '*',
            { itemType: ['*.*', { profileTemplate: ['*', 'item.*.*.*.*'] }] },
            { markerIcon: ['*'] } as any,
            { maps: ['maps_id', 'name', 'menuText'] } as any,
          ],
          // eslint-disable-next-line camelcase
          filter: { maps: { maps_id: { id: { _eq: this.mapId } } } },
          limit: 500,
          sort: ['sort'],
        }),
      )) as unknown as LayerProps[]
      return applyMapLabelOverrides(layers, this.mapId)
    } catch (error: any) {
      console.log(error)
      if (error.errors[0]?.message) throw error.errors[0].message
      else throw error
    }
  }
}
