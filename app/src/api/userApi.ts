/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { createUser, passwordRequest, passwordReset, readMe, updateMe } from '@directus/sdk'

import { directusClient } from './directus'

import type { UserItem } from 'utopia-ui'

interface DirectusError {
  errors: {
    message: string
    [key: string]: any
  }[]
}

export class UserApi {
  async register(email: string, password: string, userName: string): Promise<any> {
    try {
      return await directusClient.request(createUser({ email, password, first_name: userName }))
    } catch (error: unknown) {
      console.error('Registration error:', error)
      if (
        typeof error === 'object' &&
        error !== null &&
        'errors' in error &&
        Array.isArray((error as any).errors)
      ) {
        const directusError = error as DirectusError
        const errorMessage = directusError.errors[0]?.message

        if (errorMessage.includes('has to be unique')) {
          throw new Error('This e-mail address is already registered.')
        }

        throw new Error(errorMessage || 'Unknown error during registration.')
      }
      throw error
    }
  }

  async login(email: string, password: string): Promise<any> {
    try {
      return await directusClient.login(email, password, { mode: 'json' })
    } catch (error: any) {
      console.log(error)
      if (error.errors[0].message) throw error.errors[0].message
      else throw error
    }
  }

  async logout(): Promise<any> {
    try {
      return await directusClient.logout()
    } catch (error: any) {
      console.log(error)
      if (error.errors[0].message) throw error.errors[0].message
      else throw error
    }
  }

  async getUser(): Promise<any> {
    try {
      const user = await directusClient.request(readMe({ fields: ['*', { role: ['*'] } as any] }))
      return user
    } catch (error: any) {
      console.log(error)
      if (error.errors[0].message) throw error.errors[0].message
      else throw error
    }
  }

  async getToken(): Promise<any> {
    try {
      const token = await directusClient.getToken()
      return token
    } catch (error: any) {
      console.log(error)
      if (error.errors[0].message) throw error.errors[0].message
      else throw error
    }
  }

  async updateUser(user: UserItem): Promise<any> {
    const { id, ...userRest } = user
    try {
      const res = await directusClient.request(updateMe(userRest, { fields: ['*'] }))
      return res as any
    } catch (error: any) {
      console.log(error)
      if (error.errors[0].message) throw error.errors[0].message
      else throw error
    }
  }

  async requestPasswordReset(email: string, reset_url?: string): Promise<any> {
    try {
      return await directusClient.request(passwordRequest(email, reset_url))
    } catch (error: any) {
      console.log(error)
      if (error.errors[0].message) throw error.errors[0].message
      else throw error
    }
  }

  async passwordReset(reset_token: string, new_password: string): Promise<any> {
    try {
      return await directusClient.request(passwordReset(reset_token, new_password))
    } catch (error: any) {
      console.log(error)
      if (error.errors[0].message) throw error.errors[0].message
      else throw error
    }
  }
}
