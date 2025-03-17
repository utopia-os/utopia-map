/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { readItems } from '@directus/sdk'

import { directusClient } from './directus'

export class mapApi {
  url: string

  constructor(url: string) {
    this.url = url
  }

  async getItems() {
    try {
      const map = await directusClient.request(
        readItems('maps' as any, {
          fields: ['*', { user_type: ['name'] }],
          filter: { url: { _eq: this.url } } as any,
          limit: 500,
        }),
      )
      if (map[0]) return map[0]
      else return 'null'
    } catch (error: any) {
      console.log(error)
      if (error.errors[0]?.message) throw error.errors[0].message
      else throw error
    }
  }
}
