import { useEffect } from 'react'

import { useSetAppState } from './hooks/useAppState'

import type { AssetsApi } from '#types/AssetsApi'

export const SetAppState = ({
  assetsApi,
  embedded,
  openCollectiveApiKey,
  hideSignup,
}: {
  assetsApi: AssetsApi
  embedded?: boolean
  openCollectiveApiKey?: string
  hideSignup?: boolean
}) => {
  const setAppState = useSetAppState()

  useEffect(() => {
    setAppState({ assetsApi })
  }, [assetsApi, setAppState])

  useEffect(() => {
    setAppState({ embedded })
  }, [embedded, setAppState])

  useEffect(() => {
    setAppState({ openCollectiveApiKey })
  }, [openCollectiveApiKey, setAppState])

  useEffect(() => {
    setAppState({ hideSignup: hideSignup ?? false })
  }, [hideSignup, setAppState])

  return <></>
}
