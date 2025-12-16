import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import { MapOverlayPage } from '#components/Templates/MapOverlayPage'

import { useAuth } from './useAuth'

/**
 * @category Auth
 */
export function RequestPasswordPage({ resetUrl }: { resetUrl: string }) {
  const [email, setEmail] = useState<string>('')

  const { requestPasswordReset, loading } = useAuth()

  const navigate = useNavigate()

  const onReset = async () => {
    await toast.promise(requestPasswordReset(email, resetUrl), {
      success: {
        render() {
          void navigate('/')
          return 'Check your mailbox'
        },
        // other options
        icon: '📬',
      },
      error: {
        render({ data }) {
          return `${data as string}`
        },
      },
      pending: 'sending email ...',
    })
  }

  return (
    <MapOverlayPage backdrop className='tw:max-w-xs  tw:h-fit'>
      <h2 className='tw:text-2xl tw:font-semibold tw:mb-2 tw:text-center'>Request Password</h2>
      <input
        type='email'
        placeholder='E-Mail'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
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
          {loading ? <span className='tw:loading tw:loading-spinner'></span> : 'Send'}
        </button>
      </div>
    </MapOverlayPage>
  )
}
