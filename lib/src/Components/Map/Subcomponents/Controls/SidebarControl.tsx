import Bars3Icon from '@heroicons/react/16/solid/Bars3Icon'

import { useAppState, useSetAppState } from '#components/AppShell/hooks/useAppState'

// Converts leaflet.locatecontrol to a React Component
export const SidebarControl = () => {
  const appState = useAppState()
  const setAppState = useSetAppState()
  const toggleSidebar = () => {
    setAppState({ sideBarOpen: !appState.sideBarOpen })
  }
  return (
    <>
      <div
        className='tw:card tw:justify-center tw:items-center tw:bg-base-100 tw:flex-none tw:shadow-xl tw:px-0 tw:hover:bg-slate-300 tw:hover:cursor-pointer tw:transition-all tw:duration-300 tw:mr-2 tw:h-12 tw:w-12 '
        onClick={() => {
          toggleSidebar()
        }}
      >
        <Bars3Icon className='tw:inline-block tw:w-5 tw:h-5' />
      </div>
    </>
  )
}
