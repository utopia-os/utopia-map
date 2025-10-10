import { useState } from 'react'

import { useMyProfile } from '#components/Map/hooks/useMyProfile'

import { ActionButtons } from './ActionButtons'
import { ConnectionStatus } from './ConnectionStatus'
import { DeleteModal } from './DeleteModal'
import { EditMenu } from './EditMenu'
import { ItemAvatar } from './ItemAvatar'
import { ItemTitle } from './ItemTitle'
import { QRModal } from './QRModal'

import type { HeaderViewProps } from './types'

export function HeaderView({
  item,
  api,
  editCallback,
  deleteCallback,
  setPositionCallback,
  loading,
  hideMenu = false,
  big = false,
  truncateSubname = true,
  showAddress = true,
}: HeaderViewProps) {
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [qrModalOpen, setQrModalOpen] = useState<boolean>(false)
  const myProfile = useMyProfile()

  if (!item) return null

  const hasAvatar = !!(item.image ?? item.image_external)
  const isMyProfile = myProfile.myProfile?.id === item.id
  const showQrButton = big && isMyProfile

  return (
    <>
      <div className='tw:flex tw:flex-row'>
        <div className={'tw:grow tw:flex tw:flex-1 tw:min-w-0'}>
          <div className='tw:flex tw:flex-1 tw:min-w-0 tw:items-center'>
            <ItemAvatar
              item={item}
              big={big}
              showQrButton={showQrButton}
              onQrClick={() => setQrModalOpen(true)}
            />
            <ItemTitle
              item={item}
              big={big}
              truncateSubname={truncateSubname}
              showAddress={showAddress}
              hasAvatar={hasAvatar}
            />
          </div>
        </div>
        <EditMenu
          item={item}
          api={api}
          editCallback={editCallback}
          deleteCallback={deleteCallback}
          setPositionCallback={setPositionCallback}
          loading={loading}
          hideMenu={hideMenu}
          big={big}
          onDeleteModalOpen={() => setModalOpen(true)}
        />
      </div>

      {big && (
        <div className='tw:flex tw:row tw:mt-2 '>
          <div className='tw:grow'></div>
          <div className='tw:flex'>
            <ConnectionStatus item={item} />
            <ActionButtons item={item} />
          </div>
        </div>
      )}

      <DeleteModal
        item={item}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={deleteCallback ?? (() => undefined)}
      />

      <QRModal item={item} isOpen={qrModalOpen} onClose={() => setQrModalOpen(false)} />
    </>
  )
}
