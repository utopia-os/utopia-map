/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useItems } from '#components/Map/hooks/useItems'
import { useTags } from '#components/Map/hooks/useTags'

import { MapOverlayPage } from './MapOverlayPage'
import { TagView } from './TagView'

import type { Tag } from '#types/Tag'

function groupAndCount(arr) {
  const grouped = arr.reduce((acc, obj) => {
    const found = acc.find((item) => JSON.stringify(item.object) === JSON.stringify(obj))

    if (found) {
      found.count += 1
    } else {
      acc.push({ object: obj, count: 1 })
    }

    return acc
  }, [])

  return grouped.sort((a, b) => b.count - a.count)
}

/**
 * @category Templates
 */
export const MarketView = () => {
  const [offers, setOffers] = useState<Tag[]>([])
  const [needs, setNeeds] = useState<Tag[]>([])
  const navigate = useNavigate()

  const items = useItems()
  const tags = useTags()

  useEffect(() => {
    setOffers([])
    setNeeds([])
    for (const item of items) {
      item.offers?.forEach((o) => {
        const tag = tags.find((t) => t.id === o.tags_id)
        tag && setOffers((current) => [...current, tag])
      })
      item.needs?.forEach((n) => {
        const tag = tags.find((t) => t.id === n.tags_id)
        tag && setNeeds((current) => [...current, tag])
      })
    }
    // eslint-disable-next-line no-console
    console.log(offers)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items])

  return (
    <MapOverlayPage className='tw:rounded-none tw:overflow-y-auto tw:bg-base-200 tw:p-4!'>
      <div className='tw:grid tw:grid-cols-1 tw:md:grid-cols-2'>
        <div>
          <p className='tw:text-lg tw:font-bold'>Offers</p>
          <div className='tw:flex tw:flex-wrap'>
            {groupAndCount(offers).map((o) => (
              <TagView
                onClick={() => {
                  navigate(`/?tags=${o.object.name}`)
                }}
                key={o.object.id}
                tag={o.object}
                count={o.count}
              ></TagView>
            ))}
          </div>
        </div>
        <div>
          <p className='tw:text-lg tw:font-bold'>Needs</p>
          <div className='tw:flex tw:flex-wrap'>
            {groupAndCount(needs).map((o) => (
              <TagView
                onClick={() => {
                  navigate(`/?tags=${o.object.name}`)
                }}
                key={o.object.id}
                tag={o.object}
                count={o.count}
              ></TagView>
            ))}
          </div>
        </div>
      </div>
    </MapOverlayPage>
  )
}
