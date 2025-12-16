import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import { MapOverlayPage } from '#components/Templates/MapOverlayPage'

import { useAuth } from './useAuth'

/**
 * @category Auth
 */
export function SetNewPasswordPage() {
  const [password, setPassword] = useState<string>('')

  const { passwordReset, loading } = useAuth()

  const navigate = useNavigate()

  const onReset = async () => {
    const token = window.location.search.split('token=')[1]

    await toast.promise(passwordReset(token, password), {
      success: {
        render() {
          void navigate('/')
          return 'New password set'
        },
      },
      error: {
        render({ data }) {
          return data as string
        },
      },
      pending: 'setting password ...',
    })
  }

  return (
    <MapOverlayPage backdrop className='tw:max-w-xs  tw:h-fit'>
      <h2 className='tw:text-2xl tw:font-semibold tw:mb-2 tw:text-center'>Set new Password</h2>
      <input
        type='password'
        placeholder='Password'
        onChange={(e) => {
          setPassword(e.target.value)
        }}
        className='tw:input tw:input-bordered tw:w-full tw:max-w-xs'
      />
      <div className='tw:card-actions tw:mt-4'>
        <button
          className={
            loading
              ? 'tw:btn tw:btn-disabled tw:btn-block tw:btn-primary'
              : 'tw:btn tw:btn-primary tw:btn-block'
          }
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onClick={() => onReset()}
        >
          {loading ? <span className='tw:loading tw:loading-spinner'></span> : 'Set'}
        </button>
      </div>
    </MapOverlayPage>
  )
}
