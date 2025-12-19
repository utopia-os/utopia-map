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
}: {
  appName: string
  children: React.ReactNode
  assetsApi: AssetsApi
  embedded?: boolean
  openCollectiveApiKey?: string
  hideSignup?: boolean
}) {
  return (
    <ContextWrapper>
      <div className='tw:flex tw:flex-col tw:h-full'>
        <SetAppState
          appName={appName}
          assetsApi={assetsApi}
          embedded={embedded}
          openCollectiveApiKey={openCollectiveApiKey}
          hideSignup={hideSignup}
        />
        <NavBar appName={appName}></NavBar>
        <div id='app-content' className='tw:flex'>
          {children}
        </div>
      </div>
    </ContextWrapper>
  )
}
