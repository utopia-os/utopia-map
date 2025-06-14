import Bars3Icon from '@heroicons/react/16/solid/Bars3Icon'
import QuestionMarkIcon from '@heroicons/react/24/outline/QuestionMarkCircleIcon'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { ThemeControl } from '#components/Templates/ThemeControl'

import { useAppState, useSetAppState } from './hooks/useAppState'
import { UserControl } from './UserControl'

export default function NavBar({ appName }: { appName: string }) {
  const appState = useAppState()
  const setAppState = useSetAppState()
  const { pathname } = useLocation()
  const infoButtonTarget = pathname === '/info' ? '/' : '/info'

  const toggleSidebar = () => {
    setAppState({ sideBarOpen: !appState.sideBarOpen })
  }

  const nameRef = useRef<HTMLHeadingElement>(null)
  const [nameWidth, setNameWidth] = useState<number>(0)

  useEffect(() => {
    !appState.embedded && nameRef.current && setNameWidth(nameRef.current.scrollWidth)
  }, [nameRef, appName, appState.embedded])

  if (!appState.embedded) {
    return (
      <>
        <div className='tw:navbar tw:bg-base-100 tw:z-9998 tw:shadow-xl tw:relative tw:p-0'>
          <button
            className='tw:btn tw:btn-square tw:btn-ghost tw:ml-3'
            aria-controls='#sidenav'
            aria-haspopup='true'
            onClick={() => toggleSidebar()}
          >
            <Bars3Icon className='tw:inline-block tw:w-5 tw:h-5' />
          </button>
          <div className='tw:flex-1 tw:mr-2'>
            <div
              className={'tw:flex-1 tw:truncate tw:grid tw:grid-flow-col'}
              style={{ maxWidth: nameWidth + 62 }}
            >
              <Link
                className='tw:btn tw:btn-ghost tw:px-2 tw:normal-case tw:text-xl tw:flex-1 tw:truncate'
                to={'/'}
              >
                <h1 ref={nameRef} className='tw:truncate'>
                  {appName}
                </h1>
              </Link>
              <Link className='tw:btn tw:px-2 tw:btn-ghost' to={infoButtonTarget}>
                <QuestionMarkIcon className='tw:h-5 tw:w-5' />
              </Link>
            </div>
          </div>

          {appState.showThemeControl && <ThemeControl />}
          <UserControl />
        </div>
      </>
    )
  } else return <></>
}
