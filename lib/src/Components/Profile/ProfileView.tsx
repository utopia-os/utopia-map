/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { LatLng } from 'leaflet'
import { useEffect, useState } from 'react'
import { useMap } from 'react-leaflet'
import { useLocation, useNavigate } from 'react-router-dom'

import { useClusterRef } from '#components/Map/hooks/useClusterRef'
import { useItems, useRemoveItem, useUpdateItem } from '#components/Map/hooks/useItems'
import { useLayers } from '#components/Map/hooks/useLayers'
import { useLeafletRefs } from '#components/Map/hooks/useLeafletRefs'
import { useHasUserPermission } from '#components/Map/hooks/usePermissions'
import { useSelectPosition, useSetSelectPosition } from '#components/Map/hooks/useSelectPosition'
import { useTags } from '#components/Map/hooks/useTags'
import { HeaderView } from '#components/Map/Subcomponents/ItemPopupComponents/HeaderView'
import { MapOverlayPage } from '#components/Templates'

import { handleDelete, linkItem, unlinkItem } from './itemFunctions'
import { FlexView } from './Templates/FlexView'
import { OnepagerView } from './Templates/OnepagerView'
import { SimpleView } from './Templates/SimpleView'
import { TabsView } from './Templates/TabsView'

import type { Item } from '#types/Item'
import type { ItemsApi } from '#types/ItemsApi'
import type { Tag } from '#types/Tag'
import type { Marker } from 'leaflet'

/**
 * @category Profile
 */
export function ProfileView({ attestationApi }: { attestationApi?: ItemsApi<any> }) {
  const [item, setItem] = useState<Item>()
  const [updatePermission, setUpdatePermission] = useState<boolean>(false)
  const [relations, setRelations] = useState<Item[]>([])
  const [offers, setOffers] = useState<Tag[]>([])
  const [needs, setNeeds] = useState<Tag[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [template, setTemplate] = useState<string>('')

  const location = useLocation()
  const items = useItems()
  const updateItem = useUpdateItem()
  const map = useMap()
  const selectPosition = useSelectPosition()
  const removeItem = useRemoveItem()
  const tags = useTags()
  const navigate = useNavigate()
  const hasUserPermission = useHasUserPermission()
  const setSelectPosition = useSetSelectPosition()
  const clusterRef = useClusterRef()
  const leafletRefs = useLeafletRefs()
  const layers = useLayers()

  const [attestations, setAttestations] = useState<any[]>([])

  useEffect(() => {
    if (attestationApi) {
      attestationApi
        .getItems()
        .then((value) => {
          // eslint-disable-next-line no-console
          console.log(value)

          setAttestations(value)
          return null
        })
        // eslint-disable-next-line promise/prefer-await-to-callbacks
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error('Error fetching items:', error)
        })
    }
  }, [attestationApi])

  useEffect(() => {
    const itemId = location.pathname.split('/')[2]
    const item = items.find((i) => i.id === itemId)
    item && setItem(item)
  }, [items, location])

  useEffect(() => {
    setOffers([])
    setNeeds([])
    setRelations([])

    item?.offers?.forEach((o) => {
      const tag = tags.find((t) => t.id === o.tags_id)
      tag && setOffers((current) => [...current, tag])
    })
    item?.needs?.forEach((n) => {
      const tag = tags.find((t) => t.id === n.tags_id)
      tag && setNeeds((current) => [...current, tag])
    })
    item?.relations?.forEach((r) => {
      const item = items.find((i) => i.id === r.related_items_id)
      item && setRelations((current) => [...current, item])
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, items])

  useEffect(() => {
    const setMap = (marker: Marker, x: number) => {
      map.setView(
        new LatLng(item?.position?.coordinates[1]!, item?.position?.coordinates[0]! + x / 4),
        undefined,
      )
      setTimeout(() => {
        marker.openPopup()
      }, 500)
    }
    if (item) {
      if (item.position) {
        const marker = Object.entries(leafletRefs).find((r) => r[1].item === item)?.[1].marker
        marker &&
          clusterRef.hasLayer(marker) &&
          clusterRef?.zoomToShowLayer(marker, () => {
            const bounds = map.getBounds()
            const x = bounds.getEast() - bounds.getWest()
            setMap(marker, x)
          })
      } else {
        const parent = getFirstAncestor(item)
        const marker = Object.entries(leafletRefs).find((r) => r[1].item === parent)?.[1].marker
        marker &&
          clusterRef.hasLayer(marker) &&
          clusterRef?.zoomToShowLayer(marker, () => {
            const bounds = map.getBounds()
            const x = bounds.getEast() - bounds.getWest()
            setMap(marker, x)
          })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item])

  const getFirstAncestor = (item: Item): Item | undefined => {
    const parent = items.find((i) => i.id === item.parent)
    if (parent?.parent) {
      return getFirstAncestor(parent)
    } else {
      return parent
    }
  }

  useEffect(() => {
    item && hasUserPermission('items', 'update', item) && setUpdatePermission(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item])

  useEffect(() => {
    selectPosition && map.closePopup()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectPosition])

  useEffect(() => {
    if (item?.layer?.itemType.template) setTemplate(item.layer.itemType.template)
    else {
      const userLayer = layers.find((l) => l.userProfileLayer === true)
      if (userLayer) setTemplate(userLayer.itemType.template)
    }
  }, [item, layers])

  return (
    <>
      {item && (
        <MapOverlayPage
          key={item.id}
          className={`tw:p-0! tw:overflow-scroll tw:m-4! tw:md:w-[calc(50%-32px)] tw:w-[calc(100%-32px)] tw:min-w-80 tw:max-w-3xl tw:left-0! tw:sm:left-auto! tw:top-0 tw:bottom-0 tw:transition-opacity tw:duration-500 ${!selectPosition ? 'tw:opacity-100 tw:pointer-events-auto' : 'tw:opacity-0 tw:pointer-events-none'} tw:max-h-[1000px]`}
        >
          <>
            <div className={'tw:px-6 tw:pt-6'}>
              <HeaderView
                api={item.layer?.api}
                item={item}
                deleteCallback={(e) => handleDelete(e, item, setLoading, removeItem, map, navigate)}
                editCallback={() => navigate('/edit-item/' + item.id)}
                setPositionCallback={() => {
                  map.closePopup()
                  setSelectPosition(item)
                  navigate('/')
                }}
                big
                truncateSubname={false}
              />
            </div>

            {template === 'onepager' && <OnepagerView item={item} />}

            {template === 'simple' && <SimpleView item={item} />}

            {template === 'flex' && <FlexView item={item} />}

            {template === 'tabs' && (
              <TabsView
                attestations={attestations}
                item={item}
                loading={loading}
                offers={offers}
                needs={needs}
                relations={relations}
                updatePermission={updatePermission}
                linkItem={(id) => linkItem(id, item, updateItem)}
                unlinkItem={(id) => unlinkItem(id, item, updateItem)}
              />
            )}
          </>
        </MapOverlayPage>
      )}
    </>
  )
}
