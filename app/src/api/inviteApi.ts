/* @eslint-disable-next-line import/no-relative-parent-imports */
import { config } from '@/config'

import type { UserApi } from 'utopia-ui'

type InvitingProfileResponse = [
  {
    item: string
  },
]

export class InviteApi {
  userApi: UserApi

  constructor(userApi: UserApi) {
    this.userApi = userApi
  }

  async validateInvite(inviteId: string): Promise<string | null> {
    try {
      const response = await fetch(
        `${config.apiUrl}/flows/trigger/${config.validateInviteFlowId}?secret=${inviteId}`,
        {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )

      if (!response.ok) return null

      const data = (await response.json()) as InvitingProfileResponse

      return data[0].item
    } catch (error: unknown) {
      // eslint-disable-next-line no-console
      console.error('Error fetching inviting profile:', error)
      if (error instanceof Error && error.message) {
        throw new Error(error.message)
      } else {
        throw new Error('An unknown error occurred while fetching the inviting profile.')
      }
    }
  }

  async redeemInvite(inviteId: string, itemId: string): Promise<string | null> {
    try {
      const token = await this.userApi.getToken()

      if (!token) {
        throw new Error('User is not authenticated. Cannot redeem invite.')
      }

      const response = await fetch(`${config.apiUrl}/flows/trigger/${config.redeemInviteFlowId}`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ secret: inviteId, item: itemId }),
      })

      if (!response.ok) return null

      return (await response.json()) as string
    } catch (error: unknown) {
      // eslint-disable-next-line no-console
      console.error('Error fetching inviting profile:', error)
      if (error instanceof Error && error.message) {
        throw new Error(error.message)
      } else {
        throw new Error('An unknown error occurred while fetching the inviting profile.')
      }
    }
  }
}
