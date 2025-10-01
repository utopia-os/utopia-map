import QRCode from 'react-qr-code'

import ClipboardSVG from '#assets/share/clipboard.svg'
import DialogModal from '#components/Templates/DialogModal'

import { useShareLogic } from './hooks'

import type { Item } from '#types/Item'

interface QRModalProps {
  item: Item
  isOpen: boolean
  onClose: () => void
}

export function QRModal({ item, isOpen, onClose }: QRModalProps) {
  const { inviteLink, copyLink } = useShareLogic(item)

  return (
    <DialogModal
      isOpened={isOpen}
      showCloseButton={true}
      onClose={onClose}
      className='tw:w-[calc(100vw-2rem)] tw:max-w-96'
    >
      <div onClick={(e) => e.stopPropagation()} className='tw:text-center tw:p-4'>
        <p className='tw:text-xl'>Share your profile with others to expand your network.</p>

        <div className='tw:p-8 tw:my-8 tw:rounded-lg tw:inline-block tw:border-base-300 tw:border-2 '>
          <QRCode value={inviteLink} size={192} />
        </div>

        <div className='tw:flex tw:items-center tw:gap-2 tw:w-full tw:border-base-300 tw:border-2 tw:rounded-lg tw:p-3'>
          <span className='tw:text-sm tw:truncate tw:flex-1 tw:min-w-0'>{inviteLink}</span>
          <button
            onClick={copyLink}
            className='tw:btn tw:btn-primary tw:btn-sm tw:flex-shrink-0'
            title='Link kopieren'
          >
            <img src={ClipboardSVG} className='tw:w-4 tw:h-4' alt='Copy' />
          </button>
        </div>
      </div>
    </DialogModal>
  )
}
