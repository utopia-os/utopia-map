import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import { useMyProfile } from '#components/Map/hooks/useMyProfile'
import { MapOverlayPage } from '#components/Templates/MapOverlayPage'

import { useAuth } from './useAuth'

import type { InviteApi } from '#types/InviteApi'

interface Props {
  inviteApi: InviteApi
  showRequestPassword?: boolean
}

/**
 * @category Auth
 */
export function LoginPage({ inviteApi, showRequestPassword }: Props) {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')

  const { login, loading } = useAuth()

  const { myProfile, isMyProfileLoaded } = useMyProfile()

  const navigate = useNavigate()

  const redeemInvite = useCallback(
    async (inviteCode: string): Promise<string | null> => {
      if (!isMyProfileLoaded) return null

      if (!myProfile) {
        toast.error('Could not find your profile to redeem the invite.')
        return null
      }

      const invitingProfileId = await inviteApi.redeemInvite(inviteCode, myProfile.id)
      localStorage.removeItem('inviteCode') // Clear invite code after redeeming
      return invitingProfileId
    },
    [inviteApi, isMyProfileLoaded, myProfile],
  )

  const handleSuccess = useCallback(async () => {
    const inviteCode = localStorage.getItem('inviteCode')
    let invitingProfileId: string | null = null
    if (inviteCode) {
      invitingProfileId = await redeemInvite(inviteCode)
    }
    if (invitingProfileId) {
      navigate(`/item/${invitingProfileId}`)
    } else {
      navigate('/')
    }
  }, [navigate, redeemInvite])

  const onLogin = useCallback(async () => {
    await toast.promise(login({ email, password }), {
      success: {
        render({ data }) {
          void handleSuccess()
          return `Hi ${data?.first_name ? data.first_name : 'Traveler'}`
        },
        // other options
        icon: '✌️',
      },
      error: {
        render({ data }) {
          return `${data as string}`
        },
        autoClose: 10000,
      },
      pending: 'logging in ...',
    })
  }, [email, handleSuccess, login, password])

  useEffect(() => {
    const keyDownHandler = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        onLogin()
      }
    }
    document.addEventListener('keydown', keyDownHandler)
    return () => {
      document.removeEventListener('keydown', keyDownHandler)
    }
  }, [onLogin])

  return (
    <MapOverlayPage backdrop className='tw:max-w-xs tw:h-fit'>
      <h2 className='tw:text-2xl tw:font-semibold tw:mb-2 tw:text-center'>Login</h2>
      <input
        type='email'
        placeholder='E-Mail'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className='tw:input tw:input-bordered tw:w-full tw:max-w-xs'
      />
      <input
        type='password'
        placeholder='Password'
        onChange={(e) => setPassword(e.target.value)}
        className='tw:input tw:input-bordered tw:w-full tw:max-w-xs'
      />
      <div className='tw:text-right tw:text-primary'>
        {!showRequestPassword && (
          <Link to='/reset-password'>
            <span className='tw:text-sm  tw:inline-block  tw:hover:text-primary tw:hover:underline tw:hover:cursor-pointer tw:transition tw:duration-200'>
              Forgot Password?
            </span>
          </Link>
        )}
      </div>
      <div className='tw:card-actions'>
        <button
          className={
            loading
              ? 'tw:btn tw:btn-disabled tw:btn-block tw:btn-primary'
              : 'tw:btn tw:btn-primary tw:btn-block'
          }
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onClick={() => onLogin()}
        >
          {loading ? <span className='tw:loading tw:loading-spinner'></span> : 'Login'}
        </button>
        {showRequestPassword && (
          <>
            <div className='tw:divider tw:w-full'>OR</div>
            <Link to='/reset-password' className='tw:w-full'>
              <button className='tw:btn tw:btn-primary tw:btn-block'>{'Request Password'}</button>
            </Link>
          </>
        )}
      </div>
    </MapOverlayPage>
  )
}
