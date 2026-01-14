import { LatLng } from 'leaflet'
import { useMap } from 'react-leaflet'
import { useNavigate } from 'react-router-dom'

import { usePopupForm } from '#components/Map/hooks/usePopupForm'
import { useSetSelectPosition } from '#components/Map/hooks/useSelectPosition'
import useWindowDimensions from '#components/Map/hooks/useWindowDimension'
import { StartEndView } from '#components/Map/Subcomponents/ItemPopupComponents'
import { TextViewStatic } from '#components/Map/Subcomponents/ItemPopupComponents/TextViewStatic'
import { HeaderView } from '#components/Map/Subcomponents/ItemPopupComponents/HeaderView'

import { DateUserInfo } from './DateUserInfo'

import type { Item } from '#types/Item'

export const ItemCard = ({
  i,
  loading,
  url,
  deleteCallback,
}: {
  i: Item
  loading: boolean
  url: string
  deleteCallback: (item: Item) => void
}) => {
  const navigate = useNavigate()
  const windowDimensions = useWindowDimensions()
  const map = useMap()
  const setSelectPosition = useSetSelectPosition()
  const { setPopupForm } = usePopupForm()

  const handleEdit = () => {
    if (!i.layer) {
      throw new Error('Layer is not defined')
    }

    if (i.layer.itemType.small_form_edit && i.position) {
      void navigate('/')
      // Wait for navigation to complete before setting popup
      setTimeout(() => {
        if (i.position && i.layer) {
          const position = new LatLng(i.position.coordinates[1], i.position.coordinates[0])
          setPopupForm({
            position,
            layer: i.layer,
            item: i,
          })
          map.setView(position, map.getZoom(), { duration: 1 })
        }
      }, 100)
    } else {
      void navigate('/edit-item/' + i.id)
    }
  }

  return (
    <div
      className='tw:cursor-pointer tw:card tw:border-[1px] tw:border-base-300 tw:card-body tw:shadow-xl tw:bg-base-100 tw:text-base-content tw:p-4 tw:mb-4 tw:h-fit'
      onClick={() => {
        // We could have an onClick callback instead
        const params = new URLSearchParams(window.location.search)
        if (windowDimensions.width < 786 && i.position)
          void navigate('/' + i.id + (params.size > 0 ? `?${params.toString()}` : ''))
        else void navigate(url + i.id + (params.size > 0 ? `?${params.toString()}` : ''))
      }}
    >
      <HeaderView
        loading={loading}
        item={i}
        api={i.layer?.api}
        editCallback={() => {
          handleEdit()
        }}
        setPositionCallback={() => {
          map.closePopup()
          setSelectPosition(i)
          void navigate('/')
        }}
        deleteCallback={() => {
          deleteCallback(i)
        }}
      ></HeaderView>
      <div className='tw:overflow-y-auto tw:overflow-x-hidden tw:max-h-64 fade'>
        {i.layer?.itemType.show_start_end && <StartEndView item={i}></StartEndView>}
        {i.layer?.itemType.show_text && <TextViewStatic truncate text={i.text} />}
      </div>
      <DateUserInfo item={i}></DateUserInfo>
    </div>
  )
}
