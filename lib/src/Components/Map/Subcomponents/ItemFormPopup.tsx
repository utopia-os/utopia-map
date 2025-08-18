/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable security/detect-object-injection */
/* eslint-disable no-catch-all/no-catch-all */

import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Popup as LeafletPopup, useMap } from 'react-leaflet'
import { toast } from 'react-toastify'

import { useAuth } from '#components/Auth/useAuth'
import { TextAreaInput } from '#components/Input/TextAreaInput'
import { TextInput } from '#components/Input/TextInput'
import TemplateItemContext from '#components/Item/TemplateItemContext'
import { useResetFilterTags } from '#components/Map/hooks/useFilter'
import { useAddItem, useItems, useUpdateItem } from '#components/Map/hooks/useItems'
import { usePopupForm } from '#components/Map/hooks/usePopupForm'
import { useAddTag, useTags } from '#components/Map/hooks/useTags'
import LayerContext from '#components/Map/LayerContext'
import { hashTagRegex } from '#utils/HashTagRegex'
import { randomColor } from '#utils/RandomColor'

import type { Item } from '#types/Item'

interface Props {
  children?: React.ReactNode
}

export function ItemFormPopup(props: Props) {
  const layerContext = useContext(LayerContext)
  const { menuText, name: activeLayerName } = layerContext

  const { popupForm, setPopupForm } = usePopupForm()

  const [spinner, setSpinner] = useState(false)

  const formRef = useRef<HTMLFormElement>(null)

  const map = useMap()

  const addItem = useAddItem()
  const updateItem = useUpdateItem()
  const items = useItems()

  const tags = useTags()
  const addTag = useAddTag()

  const resetFilterTags = useResetFilterTags()

  const { user } = useAuth()

  // Extract form data into Item object
  const parseFormData = useCallback(
    (evt: React.FormEvent<HTMLFormElement>): Item => {
      if (!popupForm) {
        throw new Error('Popup form is not defined')
      }

      const formItem: Item = {} as Item
      const formData = new FormData(evt.currentTarget)

      for (const [key, value] of formData.entries()) {
        if (key && typeof value === 'string') {
          ;(formItem as unknown as Record<string, unknown>)[key] = value
        }
      }

      formItem.position = {
        type: 'Point',
        coordinates: [popupForm.position.lng, popupForm.position.lat],
      }

      return formItem
    },
    [popupForm],
  )

  // Process hashtags in text and create new tags if needed
  const processHashtags = useCallback(
    (text: string) => {
      if (!text) return

      text
        .toLocaleLowerCase()
        .match(hashTagRegex)
        ?.forEach((tag) => {
          const tagName = tag.slice(1).toLocaleLowerCase()
          if (!tags.find((t) => t.name.toLocaleLowerCase() === tagName)) {
            addTag({ id: crypto.randomUUID(), name: tag.slice(1), color: randomColor() })
          }
        })
    },
    [tags, addTag],
  )

  // Handle API operations with consistent error handling and return response data
  const handleApiOperation = useCallback(
    async (
      operation: () => Promise<Item>,
      successMessage: string,
    ): Promise<{ success: boolean; data?: Item }> => {
      try {
        const data = await operation()
        toast.success(successMessage)
        return { success: true, data }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : String(error))
        return { success: false }
      }
    },
    [],
  )

  // Update existing item
  const handleUpdateItem = useCallback(
    async (formItem: Item) => {
      if (!popupForm?.item) return false

      const result = await handleApiOperation(
        () =>
          popupForm.layer.api?.updateItem!({ ...formItem, id: popupForm.item!.id }) ??
          Promise.resolve({} as Item),
        'Item updated',
      )

      if (result.success && result.data) {
        // Ensure the item has the layer object attached
        const itemWithLayer = { ...result.data, layer: popupForm.layer }
        updateItem(itemWithLayer)
      }

      return result.success
    },
    [popupForm, handleApiOperation, updateItem],
  )

  // Create new item or update existing user profile
  const handleCreateItem = useCallback(
    async (formItem: Item) => {
      if (!popupForm) return false

      const existingUserItem = items.find(
        (i) => i.user_created?.id === user?.id && i.layer === popupForm.layer,
      )

      const itemName = formItem.name || user?.first_name
      if (!itemName) {
        toast.error('Name must be defined')
        return false
      }

      const isUserProfileUpdate = popupForm.layer.userProfileLayer && existingUserItem
      const uuid = crypto.randomUUID()

      const operation = isUserProfileUpdate
        ? () =>
            popupForm.layer.api?.updateItem!({ ...formItem, id: existingUserItem.id }) ??
            Promise.resolve({} as Item)
        : () =>
            popupForm.layer.api?.createItem!({ ...formItem, name: itemName, id: uuid }) ??
            Promise.resolve({} as Item)

      const result = await handleApiOperation(
        operation,
        isUserProfileUpdate ? 'Profile updated' : 'New item created',
      )

      if (result.success && result.data) {
        // Ensure the item has the layer object attached
        const itemWithLayer = { ...result.data, layer: popupForm.layer }

        if (isUserProfileUpdate) {
          updateItem(itemWithLayer)
        } else {
          addItem(itemWithLayer)
        }
        resetFilterTags()
      }

      return result.success
    },
    [popupForm, items, user, handleApiOperation, updateItem, addItem, resetFilterTags],
  )

  const handleSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault()

    if (!popupForm) {
      throw new Error('Popup form is not defined')
    }

    setSpinner(true)

    try {
      const formItem = parseFormData(evt)

      // Process hashtags if text exists
      if (formItem.text) {
        processHashtags(formItem.text)
      }

      let success: boolean
      if (popupForm.item) {
        success = await handleUpdateItem(formItem)
      } else {
        success = await handleCreateItem(formItem)
      }

      if (success) {
        map.closePopup()
        setPopupForm(null)
      }
    } finally {
      setSpinner(false)
    }
  }

  const resetPopup = () => {
    if (formRef.current) {
      formRef.current.reset()
    }
  }

  useEffect(() => {
    resetPopup()
  }, [popupForm?.position])

  return (
    popupForm &&
    popupForm.layer.name === activeLayerName && (
      <LeafletPopup
        minWidth={275}
        maxWidth={275}
        autoPanPadding={[20, 80]}
        eventHandlers={{
          remove: () => {
            setTimeout(function () {
              resetPopup()
            }, 100)
          },
        }}
        position={popupForm.position}
      >
        <form
          ref={formRef}
          onReset={resetPopup}
          autoComplete='off'
          onSubmit={(e) => handleSubmit(e)}
        >
          {popupForm.item ? (
            <div className='tw:h-3'></div>
          ) : (
            <div className='tw:flex tw:justify-center'>
              <b className='tw:text-xl tw:text-center tw:font-bold'>{menuText}</b>
            </div>
          )}

          {props.children ? (
            <TemplateItemContext.Provider value={popupForm.item}>
              {props.children}
            </TemplateItemContext.Provider>
          ) : (
            <>
              <TextInput
                type='text'
                placeholder='Name'
                dataField='name'
                defaultValue={popupForm.item ? popupForm.item.name : ''}
                inputStyle=''
              />
              <TextAreaInput
                key={popupForm.position.toString()}
                placeholder='Text'
                dataField='text'
                defaultValue={popupForm.item?.text ?? ''}
                inputStyle='tw:h-40 tw:mt-5'
              />
            </>
          )}

          <div className='tw:flex tw:justify-center'>
            <button
              className={
                spinner
                  ? 'tw:btn tw:btn-disabled tw:mt-5 tw:place-self-center'
                  : 'tw:btn tw:mt-5 tw:place-self-center'
              }
              type='submit'
            >
              {spinner ? <span className='tw:loading tw:loading-spinner'></span> : 'Save'}
            </button>
          </div>
        </form>
      </LeafletPopup>
    )
  )
}
