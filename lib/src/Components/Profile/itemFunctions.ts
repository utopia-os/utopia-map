/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable no-catch-all/no-catch-all */
import { toast } from 'react-toastify'

import { encodeTag } from '#utils/FormatTags'
import { hashTagRegex } from '#utils/HashTagRegex'
import { randomColor } from '#utils/RandomColor'
import { removeItemFromUrl } from '#utils/UrlHelper'

import type { FormState } from '#types/FormState'
import type { Item } from '#types/Item'

// Handle API operations with consistent error handling and return response data
const handleApiOperation = async (
  operation: () => Promise<Item>,
  toastId: string | number,
  successMessage: string,
): Promise<{ success: boolean; data?: Item }> => {
  try {
    const data = await operation()
    toast.update(toastId, {
      render: successMessage,
      type: 'success',
      isLoading: false,
      autoClose: 5000,
    })
    return { success: true, data }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    toast.update(toastId, {
      render: errorMessage,
      type: 'error',
      isLoading: false,
      autoClose: 5000,
      closeButton: true,
    })
    return { success: false }
  }
}

// eslint-disable-next-line promise/avoid-new
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const submitNewItem = async (
  evt: any,
  type: string,
  item,
  setLoading,
  tags,
  addTag,
  addItem,
  linkItem,
  resetFilterTags,
  layers,
  addItemPopupType,
  setAddItemPopupType,
  user,
) => {
  evt.preventDefault()
  const formItem: Item = {} as Item
  Array.from(evt.target).forEach((input: HTMLInputElement) => {
    if (input.name) {
      formItem[input.name] = input.value
    }
  })
  setLoading(true)
  formItem.text &&
    formItem.text
      .toLocaleLowerCase()
      .match(hashTagRegex)
      ?.map((tag) => {
        if (!tags.find((t) => t.name.toLocaleLowerCase() === tag.slice(1).toLocaleLowerCase())) {
          addTag({ id: crypto.randomUUID(), name: tag.slice(1), color: randomColor() })
        }
        return null
      })
  const uuid = crypto.randomUUID()

  const layer = layers.find(
    (l) => l.name.toLocaleLowerCase().replace('s', '') === addItemPopupType.toLocaleLowerCase(),
  )

  const toastId = toast.loading('Creating new item...')

  const result = await handleApiOperation(
    async () => {
      const serverResult = await layer?.api?.createItem!({
        ...formItem,
        id: uuid,
        type,
        parent: item.id,
      })
      return serverResult as Item
    },
    toastId,
    'New item created',
  )

  if (result.success && result.data) {
    // Find the layer object by ID from server response
    const layerForItem = layers.find((l) => l.id === result.data!.layer) || layer
    const itemWithLayer = { ...result.data, layer: layerForItem, user_created: user ?? undefined }
    addItem(itemWithLayer)
    await linkItem(uuid)
    resetFilterTags()
  }
  setLoading(false)
  setAddItemPopupType('')
}

export const linkItem = async (id: string, item: Item, updateItem) => {
  const newRelations = item.relations ?? []
  newRelations?.push({ items_id: item.id, related_items_id: id })
  const updatedItem = { id: item.id, relations: newRelations }

  const toastId = toast.loading('Linking item...')

  const result = await handleApiOperation(
    async () => {
      const serverResult = await item?.layer?.api?.updateItem!(updatedItem)
      return serverResult!
    },
    toastId,
    'Item linked',
  )

  if (result.success && result.data) {
    // Find the layer object by ID from server response or use existing layer
    const layer = item.layer
    const itemWithLayer = {
      ...result.data,
      layer,
      relations: newRelations,
      user_created: item.user_created,
    }
    updateItem(itemWithLayer)
  }
}

export const unlinkItem = async (id: string, item: Item, updateItem) => {
  const newRelations = item.relations?.filter((r) => r.related_items_id !== id)
  const updatedItem = { id: item.id, relations: newRelations }

  const toastId = toast.loading('Unlinking item...')

  const result = await handleApiOperation(
    async () => {
      const serverResult = await item?.layer?.api?.updateItem!(updatedItem)
      return serverResult!
    },
    toastId,
    'Item unlinked',
  )

  if (result.success && result.data) {
    // Find the layer object by ID from server response or use existing layer
    const layer = item.layer
    const itemWithLayer = { ...result.data, layer, user_created: item.user_created }
    updateItem(itemWithLayer)
  }
}

export const handleDelete = async (
  event: React.MouseEvent<HTMLElement>,
  item: Item,
  setLoading,
  removeItem,
  map,
  navigate,
) => {
  event.stopPropagation()
  setLoading(true)

  try {
    await item.layer?.api?.deleteItem!(item.id)
    removeItem(item)
    toast.success('Item deleted')

    map.closePopup()
    removeItemFromUrl()
    navigate('/')
  } catch (error) {
    toast.error(error instanceof Error ? error.message : String(error))
  }

  setLoading(false)
}

export const onUpdateItem = async (
  state: FormState,
  item: Item,
  tags,
  addTag,
  setLoading,
  navigate,
  updateItem,
  addItem,
  user,
  params,
) => {
  let changedItem = {} as Item

  const offerUpdates: any[] = []
  // check for new offers
  state.offers?.map((o) => {
    const existingOffer = item?.offers?.find((t) => t.tags_id === o.id)
    existingOffer && offerUpdates.push(existingOffer.tags_id)
    if (!existingOffer && !tags.some((t: { id: string }) => t.id === o.id))
      addTag({ ...o, offer_or_need: true })
    !existingOffer && offerUpdates.push({ items_id: item?.id, tags_id: o.id })
    return null
  })

  const needsUpdates: any[] = []

  state.needs?.map((n) => {
    const existingNeed = item?.needs?.find((t) => t.tags_id === n.id)
    existingNeed && needsUpdates.push(existingNeed.tags_id)
    !existingNeed && needsUpdates.push({ items_id: item?.id, tags_id: n.id })
    !existingNeed && !tags.some((t) => t.id === n.id) && addTag({ ...n, offer_or_need: true })
    return null
  })

  // update profile item in current state
  changedItem = {
    id: state.id,
    name: state.name,
    subname: state.subname,
    text: state.text,
    ...(state.color && { color: state.color }),
    position: item.position,
    ...(state.group_type && { group_type: state.group_type }),
    ...(state.status && { status: state.status }),
    contact: state.contact,
    telephone: state.telephone,
    ...(state.end && { end: state.end }),
    ...(state.start && { start: state.start }),
    ...(state.marker_icon && { markerIcon: state.marker_icon.id }),
    next_appointment: state.next_appointment,
    ...(state.image.length > 10 && { image: state.image }),
    ...(state.offers.length > 0 && { offers: offerUpdates }),
    ...(state.needs.length > 0 && { needs: needsUpdates }),
    ...(state.openCollectiveSlug && { openCollectiveSlug: state.openCollectiveSlug }),
    gallery: state.gallery.map((i) => ({
      directus_files_id: typeof i.directus_files_id !== 'string' && i.directus_files_id.id,
    })),
  }

  const offersState: any[] = []
  const needsState: any[] = []

  state.offers.map((o) => {
    offersState.push({ items_id: item?.id, tags_id: o.id })
    return null
  })

  state.needs.map((n) => {
    needsState.push({ items_id: item?.id, tags_id: n.id })
    return null
  })

  changedItem = { ...changedItem, offers: offersState, needs: needsState }

  setLoading(true)

  state.text
    ?.toLocaleLowerCase()
    .match(hashTagRegex)
    ?.map((tag) => {
      if (!tags.find((t) => t.name.toLocaleLowerCase() === tag.slice(1).toLocaleLowerCase())) {
        addTag({
          id: crypto.randomUUID(),
          name: encodeTag(tag.slice(1).toLocaleLowerCase()),
          color: randomColor(),
        })
      }
      return null
    })

  // take care that addTag request comes before item request
  await sleep(200)

  if (!item.new) {
    const toastId = toast.loading('updating Item  ...')

    const result = await handleApiOperation(
      async () => {
        const serverResult = await item?.layer?.api?.updateItem!(changedItem)
        return serverResult!
      },
      toastId,
      'Item updated',
    )

    if (result.success && result.data) {
      // Use server response with additional client-side data
      const itemWithLayer = {
        ...result.data,
        layer: item.layer,
        markerIcon: state.marker_icon,
        gallery: state.gallery,
        user_created: item.user_created,
      }
      updateItem(itemWithLayer)
      navigate(`/item/${item.id}${params && '?' + params}`)
    }
    setLoading(false)
  } else {
    item.new = false
    const toastId = toast.loading('updating Item  ...')

    const result = await handleApiOperation(
      async () => {
        const serverResult = await item.layer?.api?.createItem!(changedItem)
        return serverResult!
      },
      toastId,
      'Item updated',
    )

    if (result.success && result.data) {
      // Use server response with additional client-side data
      const itemWithLayer = {
        ...result.data,
        layer: item.layer,
        user_created: user,
      }
      addItem(itemWithLayer)
      navigate(`/${params && '?' + params}`)
    }
    setLoading(false)
  }
}
