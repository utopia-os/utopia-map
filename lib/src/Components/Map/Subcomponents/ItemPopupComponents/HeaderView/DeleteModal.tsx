import DialogModal from '#components/Templates/DialogModal'

import type { Item } from '#types/Item'

interface DeleteModalProps {
  item: Item
  isOpen: boolean
  onClose: () => void
  onConfirm: (e: React.MouseEvent) => void
}

export function DeleteModal({ item, isOpen, onClose, onConfirm }: DeleteModalProps) {
  const handleConfirm = (e: React.MouseEvent) => {
    onConfirm(e)
    onClose()
  }

  return (
    <DialogModal isOpened={isOpen} title='Are you sure?' showCloseButton={false} onClose={onClose}>
      <div
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <span>
          Do you want to delete <b>{item.name}</b>?
        </span>
        <div className='tw:grid'>
          <div className='tw:flex tw:justify-between'>
            <label className='tw:btn tw:mt-4 tw:btn-error' onClick={handleConfirm}>
              Yes
            </label>
            <label className='tw:btn tw:mt-4' onClick={onClose}>
              No
            </label>
          </div>
        </div>
      </div>
    </DialogModal>
  )
}
