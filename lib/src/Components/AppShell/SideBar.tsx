import ChevronRightIcon from '@heroicons/react/24/outline/ChevronRightIcon'
import { NavLink, useLocation } from 'react-router-dom'

import { useAppState, useSetAppState } from './hooks/useAppState'
import SidebarSubmenu from './SidebarSubmenu'

export interface Route {
  path: string
  icon: JSX.Element
  name: string
  submenu?: Route[]
  blank?: boolean
  color?: string
}

/**
 * @category AppShell
 */
export function SideBar({ routes, bottomRoutes }: { routes: Route[]; bottomRoutes?: Route[] }) {
  const location = useLocation()

  const params = new URLSearchParams(window.location.search)

  const appState = useAppState()
  const setAppState = useSetAppState()

  const toggleSidebarOpen = () => {
    setAppState({ sideBarOpen: !appState.sideBarOpen })
  }

  const toggleSidebarSlim = () => {
    setAppState({ sideBarSlim: !appState.sideBarSlim })
  }

  return (
    <nav
      id='sidenav'
      className={`${appState.sideBarOpen ? 'tw:translate-x-0' : 'tw:-translate-x-full'}
          ${appState.sideBarSlim ? 'tw:w-15' : 'tw:w-48'}
          ${appState.embedded ? 'tw:mt-5.5 tw:h-[calc(100dvh-22px)]' : 'tw:mt-16 tw:h-[calc(100dvh-64px)]'}
          tw:fixed tw:left-0 tw:transition-all tw:duration-300 tw:top-0 tw:z-10035 
          tw:overflow-hidden tw:shadow-xl tw:dark:bg-zinc-800`}
    >
      <div
        className={`tw:flex tw:flex-col  ${appState.embedded ? 'tw:h-full' : 'tw:h-[calc(100dvh-64px)]'}`}
      >
        <ul className='tw:menu tw:w-full tw:bg-base-100 tw:text-base-content tw:p-0'>
          {routes.map((route, k) => {
            return (
              <li className='' key={k}>
                {route.submenu ? (
                  <SidebarSubmenu {...route} />
                ) : (
                  <NavLink
                    end
                    target={route.blank ? '_blank' : '_self'}
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    to={`${route.path}${params && '?' + params.toString()}`}
                    className={({ isActive }) =>
                      isActive
                        ? 'tw:font-semibold  tw:bg-base-200 tw:rounded-none!'
                        : 'tw:font-normal tw:rounded-none!'
                    }
                    onClick={() => {
                      if (screen.width < 640 && !appState.sideBarSlim) toggleSidebarOpen()
                    }}
                  >
                    <div
                      className='tw:p-1.5 tw:rounded-selector tw:text-white tw:h-9 tw:w-9 tw:flex tw:items-center tw:justify-center'
                      style={{ backgroundColor: route.color ?? '#777' }}
                    >
                      {route.icon}
                    </div>
                    <span
                      className={appState.sideBarSlim ? 'tw:hidden' : ''}
                      data-te-sidenav-slim='false'
                    >
                      {route.name}
                    </span>
                    {(location.pathname.includes(route.path) && route.path.length > 1) ||
                    location.pathname === route.path ? (
                      <span
                        className='tw:absolute tw:inset-y-0 tw:left-0 tw:w-1 tw:rounded-tr-md tw:rounded-br-md'
                        style={{ backgroundColor: route.color ?? '#777' }}
                        aria-hidden='true'
                      ></span>
                    ) : null}
                  </NavLink>
                )}
              </li>
            )
          })}
        </ul>

        <div
          id='slim-toggler'
          className='tw:w-full tw:bg-base-100  tw:flex-1 tw:grid tw:place-items-end'
          aria-haspopup='true'
        >
          <div className='tw:w-full'>
            <ul
              className='tw:menu tw:w-full tw:bg-base-100 tw:text-base-content tw:p-0 tw:mb-0'
              data-te-sidenav-menu-ref
            >
              {bottomRoutes?.map((route, k) => {
                return (
                  <li className='' key={k}>
                    {route.submenu ? (
                      <SidebarSubmenu {...route} />
                    ) : (
                      <NavLink
                        end
                        target={route.blank ? '_blank' : '_self'}
                        to={route.path}
                        className={({ isActive }) =>
                          `tw:px-4 ${isActive ? 'tw:font-semibold  tw:bg-base-200 tw:rounded-none!' : 'tw:font-normal tw:rounded-none!'}`
                        }
                        onClick={() => {
                          if (screen.width < 640 && !appState.sideBarSlim) toggleSidebarOpen()
                        }}
                      >
                        {route.icon}
                        <span
                          className={appState.sideBarSlim ? 'tw:hidden' : ''}
                          data-te-sidenav-slim='false'
                        >
                          {route.name}
                        </span>
                        {(location.pathname.includes(route.path) && route.path.length > 1) ||
                        location.pathname === route.path ? (
                          <span
                            className='tw:absolute tw:inset-y-0 tw:left-0 tw:w-1 tw:rounded-tr-md tw:rounded-br-md tw:bg-primary '
                            aria-hidden='true'
                          ></span>
                        ) : null}
                      </NavLink>
                    )}
                  </li>
                )
              })}
            </ul>

            <ChevronRightIcon
              className={
                'tw:w-5 tw:h-5 tw:mb-4 tw:mr-5 tw:mt-2  tw:cursor-pointer tw:float-right tw:delay-400 tw:duration-500 tw:transition-all ' +
                (!appState.sideBarSlim ? 'tw:rotate-180' : '')
              }
              onClick={() => {
                toggleSidebarSlim()
              }}
            />
          </div>
        </div>
      </div>
    </nav>
  )
}
