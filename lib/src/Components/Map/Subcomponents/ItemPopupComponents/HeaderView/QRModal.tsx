import QRCode from 'react-qr-code'

import DialogModal from '#components/Templates/DialogModal'

import { useShareLogic } from './hooks'
import { ItemAvatar } from './ItemAvatar'
import { ShareButton } from './ShareButton'

import type { Item } from '#types/Item'

interface QRModalProps {
  item: Item
  isOpen: boolean
  onClose: () => void
}

export function QRModal({ item, isOpen, onClose }: QRModalProps) {
  const { inviteLink } = useShareLogic(item)

  return (
    <DialogModal
      isOpened={isOpen}
      showCloseButton={true}
      onClose={onClose}
      className='tw:w-[calc(100vw-2rem)] tw:!max-w-96'
    >
      <div onClick={(e) => e.stopPropagation()} className='tw:text-center tw:p-4'>
        <p className='tw:text-xl tw:font-bold'>Share your Profile to expand your Network!</p>

        <div className='tw:flex tw:flex-col tw:items-center tw:gap-4 tw:my-8'>
          <ItemAvatar item={item} extraLarge={true} />
          <div className='tw:p-8 tw:mt-4 tw:rounded-lg tw:inline-block tw:border-base-300 tw:bg-base-200 tw:border-1'>
            <QRCode value={inviteLink} size={164} />
          </div>
        </div>

        <div className='tw:flex tw:items-center tw:gap-2 tw:w-full tw:border-base-300 tw:border-1 tw:rounded-selector tw:p-2'>
          <span className='tw:text-sm tw:truncate tw:flex-1 tw:min-w-0'>{inviteLink}</span>
          <ShareButton item={item} dropdownDirection='up' />
        </div>
      </div>
    </DialogModal>
  )
}
