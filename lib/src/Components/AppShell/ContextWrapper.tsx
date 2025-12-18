import { useContext, createContext } from 'react'
import { BrowserRouter as Router, useInRouterContext } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'

import { QuestsProvider } from '#components/Gaming/hooks/useQuests'
import { ClusterRefProvider } from '#components/Map/hooks/useClusterRef'
import { FilterProvider } from '#components/Map/hooks/useFilter'
import { ItemsProvider } from '#components/Map/hooks/useItems'
import { LayersProvider } from '#components/Map/hooks/useLayers'
import { LeafletRefsProvider } from '#components/Map/hooks/useLeafletRefs'
import { PermissionsProvider } from '#components/Map/hooks/usePermissions'
import { PopupFormProvider } from '#components/Map/hooks/usePopupForm'
import { SelectPositionProvider } from '#components/Map/hooks/useSelectPosition'
import { TagsProvider } from '#components/Map/hooks/useTags'

import { AppStateProvider } from './hooks/useAppState'

import type { CloseButtonProps } from 'react-toastify'

// Helper context to determine if the ContextWrapper is already present.
const ContextCheckContext = createContext(false)

const CloseButton = ({ closeToast }: CloseButtonProps) => (
  <button
    className='tw:btn tw:btn-sm tw:btn-circle tw:btn-ghost tw:absolute tw:right-2 tw:top-2 tw:focus:outline-hidden'
    onClick={closeToast}
  >
    ✕
  </button>
)

export const ContextWrapper = ({ children }: { children: React.ReactNode }) => {
  const isWrapped = useContext(ContextCheckContext)
  const isInsideRouter = useInRouterContext()

  // Build the component tree from inside out
  let content = <>{children}</>

  if (!isWrapped) {
    content = (
      <ContextCheckContext.Provider value={true}>
        <Wrappers>{content}</Wrappers>
      </ContextCheckContext.Provider>
    )
  }

  if (!isInsideRouter) {
    content = <Router>{content}</Router>
  }

  return content
}

// eslint-disable-next-line react/prop-types
export const Wrappers = ({ children }) => {
  return (
    <PermissionsProvider initialPermissions={[]}>
      <TagsProvider initialTags={[]}>
        <LayersProvider initialLayers={[]}>
          <FilterProvider initialTags={[]}>
            <ItemsProvider initialItems={[]}>
              <SelectPositionProvider>
                <LeafletRefsProvider initialLeafletRefs={{}}>
                  <AppStateProvider>
                    <ClusterRefProvider>
                      <PopupFormProvider>
                        <QuestsProvider initialOpen={true}>
                          <ToastContainer
                            position='top-right'
                            autoClose={2000}
                            hideProgressBar
                            newestOnTop={false}
                            closeOnClick
                            rtl={false}
                            pauseOnFocusLoss
                            draggable
                            pauseOnHover
                            theme='light'
                            closeButton={CloseButton}
                          />
                          {children}
                        </QuestsProvider>
                      </PopupFormProvider>
                    </ClusterRefProvider>
                  </AppStateProvider>
                </LeafletRefsProvider>
              </SelectPositionProvider>
            </ItemsProvider>
          </FilterProvider>
        </LayersProvider>
      </TagsProvider>
    </PermissionsProvider>
  )
}
