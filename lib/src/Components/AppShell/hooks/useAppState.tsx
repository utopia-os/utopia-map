/* eslint-disable react/prop-types */
import { useCallback, useState, createContext, useContext } from 'react'

import type { AssetsApi } from '#types/AssetsApi'

interface AppState {
  assetsApi: AssetsApi
  sideBarOpen: boolean
  sideBarSlim: boolean
  showThemeControl: boolean
  embedded: boolean
  openCollectiveApiKey: string
  hideSignup: boolean
}

type UseAppManagerResult = ReturnType<typeof useAppManager>

const initialAppState: AppState = {
  assetsApi: {} as AssetsApi,
  sideBarOpen: false,
  sideBarSlim: false,
  showThemeControl: false,
  embedded: false,
  openCollectiveApiKey: '',
  hideSignup: false,
}

const AppContext = createContext<UseAppManagerResult>({
  state: initialAppState,
  setAppState: () => {},
})

function useAppManager(): {
  state: AppState
  setAppState: (newState: Partial<AppState>) => void
} {
  const [state, setState] = useState<AppState>(initialAppState)

  const setAppState = useCallback((newState: Partial<AppState>) => {
    setState((prevState) => ({
      ...prevState,
      ...newState,
    }))
  }, [])

  return { state, setAppState }
}

export const AppStateProvider: React.FunctionComponent<{
  children?: React.ReactNode
}> = ({ children }) => <AppContext.Provider value={useAppManager()}>{children}</AppContext.Provider>

export const useAppState = (): AppState => {
  const { state } = useContext(AppContext)
  return state
}

export const useSetAppState = (): UseAppManagerResult['setAppState'] => {
  const { setAppState } = useContext(AppContext)
  return setAppState
}
