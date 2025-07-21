/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { toast } from 'react-toastify'

import { encodeTag } from '#utils/FormatTags'
import { hashTagRegex } from '#utils/HashTagRegex'
import { randomColor } from '#utils/RandomColor'

import type { FormState } from '#types/FormState'
import type { Item } from '#types/Item'

// eslint-disable-next-line promise/avoid-new
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const submitNewItem = async (
  evt: any,
  type: string,
  item,
  user,
  setLoading,
  tags,
  addTag,
  addItem,
  linkItem,
  resetFilterTags,
  layers,
  addItemPopupType,
  setAddItemPopupType,
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

  let success = false
  try {
    await layer?.api?.createItem!({ ...formItem, id: uuid, type, parent: item.id })
    await linkItem(uuid)
    success = true
    // eslint-disable-next-line no-catch-all/no-catch-all
  } catch (error) {
    toast.error(error.toString())
  }
  if (success) {
    addItem({ ...formItem, id: uuid, type, layer, user_created: user, parent: item.id })
    toast.success('New item created')
    resetFilterTags()
  }
  setLoading(false)
  setAddItemPopupType('')
}

export const linkItem = async (id: string, item: Item, updateItem) => {
  const newRelations = item.relations ?? []
  newRelations?.push({ items_id: item.id, related_items_id: id })
  const updatedItem = { id: item.id, relations: newRelations }

  let success = false
  try {
    await item?.layer?.api?.updateItem!(updatedItem)
    success = true
    // eslint-disable-next-line no-catch-all/no-catch-all
  } catch (error) {
    toast.error(error.toString())
  }
  if (success) {
    updateItem({ ...item, relations: newRelations })
    toast.success('Item linked')
  }
}

export const unlinkItem = async (id: string, item: Item, updateItem) => {
  const newRelations = item.relations?.filter((r) => r.related_items_id !== id)
  const updatedItem = { id: item.id, relations: newRelations }

  let success = false
  try {
    await item?.layer?.api?.updateItem!(updatedItem)
    success = true
    // eslint-disable-next-line no-catch-all/no-catch-all
  } catch (error) {
    toast.error(error.toString())
  }
  if (success) {
    updateItem({ ...item, relations: newRelations })
    toast.success('Item unlinked')
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
  let success = false
  try {
    await item.layer?.api?.deleteItem!(item.id)
    success = true
    // eslint-disable-next-line no-catch-all/no-catch-all
  } catch (error) {
    toast.error(error.toString())
  }
  if (success) {
    removeItem(item)
    toast.success('Item deleted')
  }
  setLoading(false)
  map.closePopup()
  const params = new URLSearchParams(window.location.search)
  window.history.pushState({}, '', '/' + `${params ? `?${params}` : ''}`)
  navigate('/')
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
    .toLocaleLowerCase()
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
    await (item?.layer?.api?.updateItem &&
      toast
        .promise(item?.layer?.api?.updateItem(changedItem), {
          pending: 'updating Item  ...',
          success: 'Item updated',
          error: {
            render({ data }) {
              return `${data}`
            },
          },
        })
        .catch(setLoading(false))
        .then(
          () =>
            item &&
            updateItem({
              ...item,
              ...changedItem,
              markerIcon: state.marker_icon,
              gallery: state.gallery,
            }),
        )
        .then(() => {
          setLoading(false)
          navigate(`/item/${item.id}${params && '?' + params}`)
          return null
        }))
  } else {
    item.new = false
    await (item.layer?.api?.createItem &&
      toast
        .promise(item.layer?.api?.createItem(changedItem), {
          pending: 'updating Item  ...',
          success: 'Item updated',
          error: {
            render({ data }) {
              return `${data}`
            },
          },
        })
        .catch(setLoading(false))
        .then(
          () =>
            item &&
            addItem({
              ...item,
              ...changedItem,
              layer: item.layer,
              user_created: user,
            }),
        )
        .then(() => {
          setLoading(false)
          navigate(`/item/${item.id}${params && '?' + params}`)
          return null
        }))
  }
}
