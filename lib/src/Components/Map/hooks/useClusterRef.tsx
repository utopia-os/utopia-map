/* eslint-disable react/prop-types */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext, useState } from 'react'

type UseClusterRefManagerResult = ReturnType<typeof useClusterRefManager>

const ClusterRefContext = createContext<UseClusterRefManagerResult>({
  clusterRef: {} as React.MutableRefObject<undefined>,
  setClusterRef: () => {},
})

function useClusterRefManager(): {
  clusterRef: any
  setClusterRef: React.Dispatch<React.SetStateAction<React.MutableRefObject<undefined>>>
} {
  const [clusterRef, setClusterRef] = useState<React.MutableRefObject<undefined>>(
    {} as React.MutableRefObject<undefined>,
  )

  return { clusterRef, setClusterRef }
}

export const ClusterRefProvider: React.FunctionComponent<{
  children?: React.ReactNode
}> = ({ children }) => (
  <ClusterRefContext.Provider value={useClusterRefManager()}>{children}</ClusterRefContext.Provider>
)

export const useClusterRef = (): any => {
  const { clusterRef } = useContext(ClusterRefContext)
  return clusterRef
}

export const useSetClusterRef = (): UseClusterRefManagerResult['setClusterRef'] => {
  const { setClusterRef } = useContext(ClusterRefContext)
  return setClusterRef
}
