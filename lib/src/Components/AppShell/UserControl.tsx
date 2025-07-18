import EllipsisVerticalIcon from '@heroicons/react/16/solid/EllipsisVerticalIcon'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'

import { useAuth } from '#components/Auth/useAuth'
import { useItems } from '#components/Map/hooks/useItems'

import { useAppState } from './hooks/useAppState'

import type { Item } from '#types/Item'

export const UserControl = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const appState = useAppState()

  const [userProfile, setUserProfile] = useState<Item>({} as Item)
  const items = useItems()

  useEffect(() => {
    const profile =
      user && items.find((i) => i.user_created?.id === user.id && i.layer?.userProfileLayer)
    profile
      ? setUserProfile(profile)
      : setUserProfile({ id: 'new', name: user?.first_name ?? '', text: '' })
  }, [user, items])

  const onLogout = async () => {
    await toast.promise(logout(), {
      success: {
        render() {
          return 'Bye bye'
        },
        // other options
        icon: '👋',
      },
      error: {
        render({ data }) {
          return JSON.stringify(data)
        },
      },
      pending: 'logging out ..',
    })
  }
  return (
    <>
      {isAuthenticated ? (
        <div className='tw:flex tw:mr-2'>
          <Link
            to={`${userProfile.id && '/item/' + userProfile.id}`}
            className='tw:flex tw:items-center'
          >
            {userProfile.image && (
              <div className='tw:avatar'>
                <div className='tw:w-10 tw:rounded-full'>
                  <img src={appState.assetsApi.url + userProfile.image} />
                </div>
              </div>
            )}
            <div className='tw:ml-2 tw:mr-2'>{userProfile.name || user?.first_name}</div>
          </Link>
          <div className='tw:dropdown tw:dropdown-end'>
            <label tabIndex={0} className='tw:btn tw:btn-ghost tw:btn-square'>
              <EllipsisVerticalIcon className='tw:h-5 tw:w-5' />
            </label>
            <ul
              tabIndex={0}
              className='tw:menu tw:menu-compact tw:dropdown-content tw:mt-4 tw:p-2 tw:shadow tw:bg-base-100 tw:rounded-box tw:w-52 tw:z-10000!'
            >
              <li>
                <Link to={`${userProfile.id && '/edit-item/' + userProfile.id}`}>Profile</Link>
              </li>
              <li>
                <Link to={'/user-settings'}>Settings</Link>
              </li>
              <li>
                <a
                  onClick={() => {
                    void onLogout()
                  }}
                >
                  Logout
                </a>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <div className='tw:mr-2 tw:flex tw:items-center'>
          <div className='tw:hidden tw:md:flex'>
            <Link to={'/login'}>
              <div className='tw:self-center tw:btn tw:btn-ghost tw:mr-2'>Login</div>
            </Link>

            <Link to={'/signup'}>
              <div className='tw:btn tw:btn-ghost tw:mr-2'>Sign Up</div>
            </Link>
          </div>
          <div className='tw:dropdown tw:dropdown-end'>
            <label tabIndex={1} className='tw:btn tw:btn-ghost tw:md:hidden'>
              <EllipsisVerticalIcon className='tw:h-5 tw:w-5' />
            </label>
            <ul
              tabIndex={1}
              className='tw:menu tw:dropdown-content tw:mt-4 tw:p-2 tw:shadow tw:bg-base-100 tw:rounded-box tw:w-52 tw:z-10000!'
            >
              <li>
                <Link to={'/login'}>Login</Link>
              </li>
              <li>
                <Link to={'/signup'}>Sign Up</Link>
              </li>
            </ul>
          </div>
        </div>
      )}
    </>
  )
}
