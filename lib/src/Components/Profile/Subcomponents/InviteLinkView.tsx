import { ClipboardIcon } from '@heroicons/react/24/outline'
import QRCode from 'react-qr-code'
import { toast } from 'react-toastify'

import type { Item } from '#types/Item'

export const InviteLinkView = ({ item }: { item: Item }) => {
  // Only show if user has permission to view secrets.
  if (!item.secrets || item.secrets.length === 0) return

  const link = `${window.location.origin}/invite/${item.secrets[0].secret}`

  const copyToClipboard = () => {
    void navigator.clipboard
      .writeText(link)
      .then(() => toast.success('Invite link copied to clipboard!'))
  }

  return (
    <div className='tw:my-10 tw:mt-2 tw:px-6'>
      <h2 className='tw:text-lg tw:font-semibold'>Invite</h2>
      <div className='tw:mt-2 tw:text-sm tw:flex tw:gap-2 tw:mb-2'>
        <input
          type='text'
          value={link}
          readOnly
          className='tw:w-full tw:p-2 tw:border tw:rounded'
        />
        <button onClick={copyToClipboard} className='btn btn-circle btn-primary'>
          <ClipboardIcon className='w-6 h-6' />
        </button>
      </div>
      <div className='tw:bg-white tw:p-2 tw:w-fit'>
        <QRCode value={link} size={128} />
      </div>
    </div>
  )
}
