/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import LinkIcon from '@heroicons/react/24/outline/LinkIcon'
import PlusIcon from '@heroicons/react/24/outline/PlusIcon'
import { useState } from 'react'

import { TextInput } from '#components/Input'
import { useItems } from '#components/Map/hooks/useItems'
import { useHasUserPermission } from '#components/Map/hooks/usePermissions'
import { useGetItemTags } from '#components/Map/hooks/useTags'
import { HeaderView } from '#components/Map/Subcomponents/ItemPopupComponents/HeaderView'
import DialogModal from '#components/Templates/DialogModal'

import type { Item } from '#types/Item'

export function ActionButton({
  item,
  triggerAddButton,
  triggerItemSelected,
  existingRelations,
  itemType,
  collection = 'items',
  customStyle,
}: {
  triggerAddButton?: any
  triggerItemSelected?: any
  existingRelations: Item[]
  itemType?: string
  collection?: string
  customStyle?: string
  item: Item
}) {
  const hasUserPermission = useHasUserPermission()
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [search, setSearch] = useState<string>('')
  const getItemTags = useGetItemTags()

  const items = useItems()

  const filterdItems = items
    .filter((i) => !itemType || i.layer?.itemType.name === itemType)
    .filter((i) => !existingRelations.some((s) => s.id === i.id))
    .filter((i) => i.id !== item.id)

  const backgroundColor =
    item.color ??
    (getItemTags(item) && getItemTags(item)[0] && getItemTags(item)[0].color
      ? getItemTags(item)[0].color
      : item.layer?.markerDefaultColor)

  return (
    <>
      {hasUserPermission(collection, 'update', item) && (
        <>
          <div className={`tw:absolute tw:right-6 tw:bottom-4 tw:flex tw:flex-col ${customStyle}`}>
            {triggerItemSelected && (
              <button
                tabIndex={0}
                className='tw:z-500 tw:btn tw:btn-circle tw:shadow'
                onClick={() => {
                  setModalOpen(true)
                }}
                style={{
                  backgroundColor,
                  color: '#fff',
                }}
              >
                <LinkIcon className='tw:h-5 tw:w-5 tw:stroke-[2.5]' />
              </button>
            )}
            {triggerAddButton && (
              <button
                tabIndex={0}
                className='tw:z-500 tw:btn tw:btn-circle tw:shadow tw:mt-2'
                onClick={() => {
                  triggerAddButton()
                }}
                style={{
                  backgroundColor,
                  color: '#fff',
                }}
              >
                <PlusIcon className='tw:w-5 tw:h-5 tw:stroke-[2.5]' />
              </button>
            )}
          </div>
          <DialogModal
            title={'Select'}
            isOpened={modalOpen}
            onClose={() => setModalOpen(false)}
            className='tw:w-xl tw:sm:w-2xl tw:min-h-80 tw:bg-base-200'
          >
            <TextInput
              defaultValue=''
              placeholder='🔍 Search'
              containerStyle='lg:col-span-2 tw:m-4 '
              updateFormValue={(val) => {
                setSearch(val)
              }}
            ></TextInput>
            <div className='tw:grid tw:grid-cols-1 tw:sm:grid-cols-2'>
              {filterdItems
                .filter((item) => {
                  return search === ''
                    ? item
                    : item.name?.toLowerCase().includes(search.toLowerCase())
                })
                .map((i) => (
                  <div
                    key={i.id}
                    className='tw:cursor-pointer tw:card tw:border-[1px] tw:border-base-300 tw:card-body tw:shadow-xl tw:bg-base-100 tw:text-base-content tw:mx-4 tw:p-4 tw:mb-4 tw:h-fit'
                    onClick={() => {
                      triggerItemSelected(i.id)
                      setModalOpen(false)
                    }}
                  >
                    <HeaderView item={i} hideMenu></HeaderView>
                  </div>
                ))}
            </div>
          </DialogModal>
        </>
      )}
    </>
  )
}
