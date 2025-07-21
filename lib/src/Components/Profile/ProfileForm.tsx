/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import classNames from 'classnames'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '#components/Auth/useAuth'
import { useItems, useUpdateItem, useAddItem } from '#components/Map/hooks/useItems'
import { useLayers } from '#components/Map/hooks/useLayers'
import { useHasUserPermission } from '#components/Map/hooks/usePermissions'
import { useAddTag, useGetItemTags, useTags } from '#components/Map/hooks/useTags'
import { MapOverlayPage } from '#components/Templates'

import { linkItem, onUpdateItem, unlinkItem } from './itemFunctions'
import { FormHeader } from './Subcomponents/FormHeader'
import { FlexForm } from './Templates/FlexForm'
import { OnepagerForm } from './Templates/OnepagerForm'
import { SimpleForm } from './Templates/SimpleForm'
import { TabsForm } from './Templates/TabsForm'

import type { FormState } from '#types/FormState'
import type { Item } from '#types/Item'
import type { MarkerIcon } from '#types/MarkerIcon'
import type { Tag } from '#types/Tag'

/**
 * @category Profile
 */
export function ProfileForm() {
  const [state, setState] = useState<FormState>({
    color: '',
    id: '',
    group_type: 'wuerdekompass',
    status: 'active',
    name: '',
    subname: '',
    text: '',
    contact: '',
    telephone: '',
    next_appointment: '',
    image: '',
    marker_icon: {} as MarkerIcon,
    offers: [] as Tag[],
    needs: [] as Tag[],
    relations: [] as Item[],
    start: '',
    end: '',
    openCollectiveSlug: '',
    gallery: [],
    uploadingImages: [],
  })

  const [updatePermission, setUpdatePermission] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [item, setItem] = useState<Item>()
  const { user } = useAuth()
  const updateItem = useUpdateItem()
  const addItem = useAddItem()
  const layers = useLayers()
  const location = useLocation()
  const tags = useTags()
  const addTag = useAddTag()
  const navigate = useNavigate()
  const hasUserPermission = useHasUserPermission()
  const getItemTags = useGetItemTags()
  const items = useItems()

  const [urlParams, setUrlParams] = useState(new URLSearchParams(location.search))

  useEffect(() => {
    item && hasUserPermission('items', 'update', item) && setUpdatePermission(true)
  }, [hasUserPermission, item])

  useEffect(() => {
    const itemId = location.pathname.split('/')[2]
    if (itemId === 'new') {
      const layer = layers.find((l) => l.userProfileLayer)
      setItem({
        id: crypto.randomUUID(),
        name: user?.first_name ?? '',
        text: '',
        layer,
        new: true,
      })
    } else {
      const item = items.find((i) => i.id === itemId)
      if (item) setItem(item)
    }
  }, [items, location.pathname, layers, user?.first_name])

  useEffect(() => {
    if (!item) return
    const newColor =
      item.color ??
      (getItemTags(item) && getItemTags(item)[0]?.color
        ? getItemTags(item)[0].color
        : item.layer?.markerDefaultColor)

    const offers = (item.offers ?? []).reduce((acc: Tag[], o) => {
      const offer = tags.find((t) => t.id === o.tags_id)
      if (offer) acc.push(offer)
      return acc
    }, [])

    const needs = (item.needs ?? []).reduce((acc: Tag[], o) => {
      const need = tags.find((t) => t.id === o.tags_id)
      if (need) acc.push(need)
      return acc
    }, [])

    const relations = (item.relations ?? []).reduce((acc: Item[], r) => {
      const relatedItem = items.find((i) => i.id === r.related_items_id)
      if (relatedItem) acc.push(relatedItem)
      return acc
    }, [])

    setState({
      color: newColor ?? '',
      id: item?.id ?? '',
      group_type: item?.group_type ?? '',
      status: item?.status ?? '',
      name: item?.name ?? '',
      subname: item?.subname ?? '',
      text: item?.text ?? '',
      contact: item?.contact ?? '',
      telephone: item?.telephone ?? '',
      next_appointment: item?.next_appointment ?? '',
      image: item?.image ?? '',
      // Do we actually mean marker_icon here?
      marker_icon: item?.markerIcon,
      offers,
      needs,
      relations,
      start: item.start ?? '',
      end: item.end ?? '',
      openCollectiveSlug: item.openCollectiveSlug ?? '',
      gallery: item.gallery ?? [],
      uploadingImages: [],
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, tags, items])

  const [template, setTemplate] = useState<string>('')

  useEffect(() => {
    if (!item) return
    if (item.layer?.itemType.template) setTemplate(item.layer?.itemType.template)
    else {
      const userLayer = layers.find((l) => l.userProfileLayer === true)
      if (userLayer) setTemplate(userLayer.itemType.template)
    }
  }, [item, layers])

  const isUpdatingGallery = state.uploadingImages.length > 0

  return (
    <>
      <MapOverlayPage
        backdrop
        closeButtonUrl={
          item ? `/item/${item.id}${window.location.search ? window.location.search : ''}` : '/'
        }
        className='tw:mx-4 tw:mt-4 tw:mb-4 tw:@container tw:overflow-x-hidden tw:w-[calc(100%-32px)]  tw:md:w-[calc(50%-32px)] tw:max-w-3xl tw:left-auto! tw:top-0 tw:bottom-0 tw:flex tw:flex-col'
      >
        {item ? (
          <form
            className='tw:flex tw:flex-col tw:flex-1 tw:min-h-0'
            onSubmit={(e) => {
              e.preventDefault()
              void onUpdateItem(
                state,
                item,
                tags,
                addTag,
                setLoading,
                navigate,
                updateItem,
                addItem,
                user,
                urlParams,
              )
            }}
          >
            <div className='tw:flex tw:flex-col tw:flex-1 pb-4'>
              <FormHeader item={item} state={state} setState={setState} />

              {template === 'onepager' && (
                <OnepagerForm item={item} state={state} setState={setState}></OnepagerForm>
              )}

              {template === 'simple' && <SimpleForm state={state} setState={setState}></SimpleForm>}

              {template === 'flex' && (
                <FlexForm item={item} state={state} setState={setState}></FlexForm>
              )}

              {template === 'tabs' && (
                <TabsForm
                  loading={loading}
                  item={item}
                  state={state}
                  setState={setState}
                  updatePermission={updatePermission}
                  linkItem={(id: string) => linkItem(id, item, updateItem)}
                  unlinkItem={(id: string) => unlinkItem(id, item, updateItem)}
                  setUrlParams={setUrlParams}
                ></TabsForm>
              )}

              <div className='tw:mb-4 tw:mt-6 tw:flex-none'>
                <button
                  className={classNames(
                    'tw:btn',
                    'tw:float-right',
                    { 'tw:loading': loading },
                    { 'tw:cursor-not-allowed tw:opacity-50': loading || isUpdatingGallery },
                  )}
                  type='submit'
                  style={{
                    // We could refactor this, it is used several times at different locations
                    backgroundColor: `${item.color ?? (getItemTags(item) && getItemTags(item)[0] && getItemTags(item)[0].color ? getItemTags(item)[0].color : item?.layer?.markerDefaultColor)}`,
                    color: '#fff',
                  }}
                >
                  Update
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className='tw:h-full tw:flex tw:flex-col tw:items-center tw:justify-center'>
            <div className='tw:loading tw:loading-spinner'></div>
          </div>
        )}
      </MapOverlayPage>
    </>
  )
}
