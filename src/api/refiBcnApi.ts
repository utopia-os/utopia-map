/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios'

import type { ItemsApi } from 'utopia-ui'

export class refiBcnApi implements ItemsApi<any> {
  collectionName: string

  constructor(collectionName: string) {
    this.collectionName = collectionName
  }

  async getItems() {
    try {
      return (
        await axios.get(
          'https://antontranelis.github.io/ReFi-Barcelona-Prototype/projects/index.json',
        )
      ).data.data
    } catch (error: any) {
      console.log(error)
      if (error.errors[0]?.message) throw error.errors[0].message
      else throw error
    }
  }
}
