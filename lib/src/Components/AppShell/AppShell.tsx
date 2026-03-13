import { ContextWrapper } from './ContextWrapper'
import NavBar from './NavBar'
import { SetAppState } from './SetAppState'

import type { AssetsApi } from '#types/AssetsApi'

export type { AssetsApi } from '#types/AssetsApi'

/**
 * @category AppShell
 */
export function AppShell({
  appName,
  children,
  assetsApi,
  embedded,
  openCollectiveApiKey,
  hideSignup,
  autoLocateOnLogin,
}: {
  appName: string
  children: React.ReactNode
  assetsApi: AssetsApi
  embedded?: boolean
  openCollectiveApiKey?: string
  hideSignup?: boolean
  autoLocateOnLogin?: boolean
}) {
  return (
    <ContextWrapper>
      <div className='tw:flex tw:flex-col tw:h-full'>
        <SetAppState
          assetsApi={assetsApi}
          embedded={embedded}
          openCollectiveApiKey={openCollectiveApiKey}
          hideSignup={hideSignup}
          autoLocateOnLogin={autoLocateOnLogin}
        />
        <NavBar appName={appName}></NavBar>
        <div id='app-content' className='tw:flex'>
          {children}
        </div>
      </div>
    </ContextWrapper>
  )
}
