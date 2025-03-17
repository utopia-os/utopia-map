/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-useless-constructor */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable no-console */
import { readPermissions } from '@directus/sdk'

import { directusClient } from './directus'

import type { ItemsApi, Permission } from 'utopia-ui'

export class permissionsApi implements ItemsApi<Permission> {
  constructor() {}

  async getItems(): Promise<Permission[]> {
    try {
      const result = await directusClient.request(
        readPermissions({ fields: ['*', { policy: ['name', 'roles'] } as any] }),
      )
      return result as unknown as Permission[]
    } catch (error: any) {
      console.log(error)
      if (error.errors[0]?.message) throw error.errors[0].message
      else throw error
    }
  }
}
