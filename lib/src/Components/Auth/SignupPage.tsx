import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import { MapOverlayPage } from '#components/Templates/MapOverlayPage'

import { useAuth } from './useAuth'

/**
 * @category Auth
 */
export function SignupPage() {
  const [email, setEmail] = useState<string>('')
  const [userName, setUserName] = useState<string>('')

  const [password, setPassword] = useState<string>('')

  const { register, loading } = useAuth()

  const navigate = useNavigate()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onRegister = async () => {
    await toast.promise(register({ email, password }, userName), {
      success: {
        render({ data }) {
          void navigate('/')
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
      pending: 'creating new user ...',
    })
  }

  useEffect(() => {
    const keyDownHandler = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        onRegister()
      }
    }
    document.addEventListener('keydown', keyDownHandler)
    return () => {
      document.removeEventListener('keydown', keyDownHandler)
    }
  }, [onRegister])

  return (
    <MapOverlayPage backdrop className='tw:max-w-xs  tw:h-fit'>
      <h2 className='tw:text-2xl tw:font-semibold tw:mb-2 tw:text-center'>Sign Up</h2>
      <input
        type='text'
        placeholder='Name'
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        className='tw:input tw:input-bordered tw:w-full tw:max-w-xs'
      />
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
      <div className='tw:card-actions tw:mt-4'>
        <button
          className={
            loading
              ? 'tw:btn tw:btn-disabled tw:btn-block tw:btn-primary'
              : 'tw:btn tw:btn-primary tw:btn-block'
          }
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onClick={() => onRegister()}
        >
          {loading ? <span className='tw:loading tw:loading-spinner'></span> : 'Sign Up'}
        </button>
      </div>
    </MapOverlayPage>
  )
}
