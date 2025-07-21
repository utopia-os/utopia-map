import { createContext, useState, useContext, useEffect, useCallback } from 'react'

import type { InviteApi } from '#types/InviteApi'
import type { UserApi } from '#types/UserApi'
import type { UserItem } from '#types/UserItem'

interface AuthProviderProps {
  userApi: UserApi
  inviteApi: InviteApi
  children?: React.ReactNode
}

interface AuthCredentials {
  email: string
  password: string
  otp?: string | undefined
}

interface AuthContextProps {
  isAuthenticated: boolean
  isInitialized: boolean
  user: UserItem | null
  login: (credentials: AuthCredentials) => Promise<UserItem | undefined>
  register: (credentials: AuthCredentials, userName: string) => Promise<UserItem | undefined>
  loading: boolean
  logout: () => Promise<void>
  updateUser: (user: UserItem) => Promise<UserItem>
  token: string | undefined
  requestPasswordReset: (email: string, reset_url: string) => Promise<void>
  passwordReset: (token: string, new_password: string) => Promise<void>
}

const AuthContext = createContext<AuthContextProps>({
  isAuthenticated: false,
  isInitialized: false,
  user: null,
  login: () => Promise.reject(Error('Unimplemented')),
  register: () => Promise.reject(Error('Unimplemented')),
  loading: false,
  logout: () => Promise.reject(Error('Unimplemented')),
  updateUser: () => Promise.reject(Error('Unimplemented')),
  token: '',
  requestPasswordReset: () => Promise.reject(Error('Unimplemented')),
  passwordReset: () => Promise.reject(Error('Unimplemented')),
})

/**
 * @category Auth
 */
export const AuthProvider = ({ userApi, children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserItem | null>(null)
  const [token, setToken] = useState<string>()
  const [loading, setLoading] = useState<boolean>(false)
  const [isInitialized, setIsInitialized] = useState<boolean>(false)
  const isAuthenticated = !!user

  const loadUser: () => Promise<UserItem | undefined> = useCallback(async () => {
    try {
      const token = await userApi.getToken()
      setToken(token)
      if (token) {
        const me = await userApi.getUser()
        setUser(me)
        setLoading(false)
        return me
      } else {
        return undefined
      }
      // eslint-disable-next-line no-catch-all/no-catch-all
    } catch (error) {
      setLoading(false)
      return undefined
    } finally {
      setIsInitialized(true)
    }
  }, [userApi])

  useEffect(() => {
    void loadUser()
  }, [loadUser])

  const login = async (credentials: AuthCredentials): Promise<UserItem | undefined> => {
    setLoading(true)
    try {
      const user = await userApi.login(credentials.email, credentials.password)
      setToken(user?.access_token)
      const fullUser = await loadUser()

      return fullUser
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const register = async (
    credentials: AuthCredentials,
    userName: string,
  ): Promise<UserItem | undefined> => {
    setLoading(true)
    try {
      /* const res = */ await userApi.register(credentials.email, credentials.password, userName)
      return await login(credentials)
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const logout = async () => {
    try {
      await userApi.logout()
      setUser(null)
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const updateUser = async (user: UserItem) => {
    setLoading(true)
    try {
      const updatedUser = await userApi.updateUser(user)
      setUser(updatedUser)
      await loadUser()
      setLoading(false)
      return updatedUser
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const requestPasswordReset = async (email: string, resetUrl?: string): Promise<void> => {
    setLoading(true)
    try {
      await userApi.requestPasswordReset(email, resetUrl)
      return setLoading(false)
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const passwordReset = async (token: string, newPassword: string): Promise<void> => {
    setLoading(true)
    try {
      await userApi.passwordReset(token, newPassword)
      return setLoading(false)
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isInitialized,
        user,
        login,
        register,
        loading,
        logout,
        updateUser,
        token,
        requestPasswordReset,
        passwordReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
export const useAuth = () => useContext(AuthContext)
