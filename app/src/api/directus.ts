/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { createDirectus, rest, authentication } from '@directus/sdk'

import type { AuthenticationData, AuthenticationStorage } from '@directus/sdk'
import type { Point } from 'geojson'
import type { Item } from 'utopia-ui'

export interface Place {
  id: string
  name: string
  text: string
  position?: Point
}

export interface Project {
  id: string
  name: string
  text: string
  position?: Point
  picture: string
  subname: string
  [key: string]: any
}

export interface Tag {
  id: string
  color: string
}

export interface Event {
  id: string
  name: string
  text: string
  position?: Point
  start: Date
  end: Date
}

export interface Update {
  id: string
  text: string
  position?: Point
  user_created: string
  date_created: string
}

interface CustomUserFields {
  position: Point
}

interface ItemSecret {
  secret: string
  item: string
}

export interface MyCollections {
  places: Place[]
  events: Event[]
  updates: Update[]
  tags: Tag[]
  projects: Project[]
  directus_users: CustomUserFields[]
  item_secrets: ItemSecret[]
  items: Item[]
  team: any[]
  features: any[]
  attestations: any[]
}

export const authLocalStorage = (mainKey = 'directus_storage') =>
  ({
    // implementation of get, here return json parsed data from localStorage at mainKey (or null if not found)
    get: async () => {
      const data = window.localStorage.getItem(mainKey)
      if (data) {
        return JSON.parse(data)
      }
      return null
    },
    // implementation of set, here set the value at mainKey in localStorage, or remove it if value is null
    set: async (value: AuthenticationData | null) => {
      if (!value) {
        return window.localStorage.removeItem(mainKey)
      }
      return window.localStorage.setItem(mainKey, JSON.stringify(value))
    },
  }) as AuthenticationStorage

export async function getRefreshToken() {
  const auth = await authLocalStorage().get()
  return auth!.refresh_token
}

export const directusClient = createDirectus<MyCollections>('https://api.utopia-lab.org/')
  .with(rest())
  .with(
    authentication('json', {
      // add this if you want to use authentication, json is important, it's type of your authentication usage, here JWT
      storage: authLocalStorage(), // here set the storage previously created
    }),
  )
