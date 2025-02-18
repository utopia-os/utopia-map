/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import { MapOverlayPage } from '#components/Templates/MapOverlayPage'

import { useAuth } from './useAuth'

/**
 * @category Auth
 */
// eslint-disable-next-line react/prop-types
export function RequestPasswordPage({ resetUrl }) {
  const [email, setEmail] = useState<string>('')

  const { requestPasswordReset, loading } = useAuth()

  const navigate = useNavigate()

  const onReset = async () => {
    await toast.promise(requestPasswordReset(email, resetUrl), {
      success: {
        render() {
          navigate('/')
          return 'Check your mailbox'
        },
        // other options
        icon: '📬',
      },
      error: {
        render({ data }) {
          return `${data}`
        },
      },
      pending: 'sending email ...',
    })
  }

  return (
    <MapOverlayPage backdrop className='tw-max-w-xs  tw-h-fit'>
      <h2 className='tw-text-2xl tw-font-semibold tw-mb-2 tw-text-center'>Reset Password</h2>
      <input
        type='email'
        placeholder='E-Mail'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className='tw-input tw-input-bordered tw-w-full tw-max-w-xs'
      />
      <div className='tw-card-actions tw-mt-4'>
        <button
          className={
            loading
              ? 'tw-btn tw-btn-disabled tw-btn-block tw-btn-primary'
              : 'tw-btn tw-btn-primary tw-btn-block'
          }
          onClick={() => onReset()}
        >
          {loading ? <span className='tw-loading tw-loading-spinner'></span> : 'Send'}
        </button>
      </div>
    </MapOverlayPage>
  )
}
