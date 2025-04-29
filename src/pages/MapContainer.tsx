/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable import/no-relative-parent-imports */
/* eslint-disable array-callback-return */
/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
import {
  UtopiaMap,
  Layer,
  PopupView,
  PopupButton,
  StartEndView,
  TextView,
  PopupForm,
  PopupStartEndInput,
  PopupTextAreaInput,
  PopupTextInput,
} from 'utopia-ui'

import { itemsApi } from '../api/itemsApi'

import type { Place } from '../api/directus'
import type { LayerProps } from 'utopia-ui'

interface layerApi {
  id: string
  api: itemsApi<Place>
}

function MapContainer({ layers, map }: { layers: LayerProps[]; map: any }) {
  const [apis, setApis] = useState<layerApi[]>([])

  useEffect(() => {
    // get timestamp for the end of the current day
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const etartOfDayISO = startOfDay.toISOString()

    layers.map((layer: LayerProps) => {
      apis &&
        setApis((current) => [
          ...current,
          {
            id: layer.id!,
            api: new itemsApi<Place>('items', layer.id, undefined, {
              _or: [
                {
                  end: {
                    _gt: etartOfDayISO,
                  },
                },
                {
                  end: {
                    _null: true,
                  },
                },
              ],
            }),
          },
        ])
    })
  }, [layers])

  useEffect(() => {}, [apis])

  return (
    <>
      <UtopiaMap
        geo={map.geo}
        zoom={map.zoom || 5}
        center={map.center ? [map.center?.coordinates[1], map.center?.coordinates[0]] : [50.6, 9.5]}
        height='100%'
        width='100%'
        showFilterControl={map.show_filter_control}
        showLayerControl={map.show_layer_control}
        showGratitudeControl={map.show_gratitude_control}
        donationWidget={map.donation_widget}
        showThemeControl={map.show_theme_control}
        defaultTheme={map.default_theme}
      >
        {layers &&
          apis &&
          layers.map((layer) => (
            <Layer
              id={layer.id}
              key={layer.id}
              name={layer.name}
              menuIcon={'https://api.utopia-lab.org/assets/' + layer.menuIcon}
              menuText={layer.menuText}
              menuColor={layer.menuColor}
              markerIcon={layer.markerIcon}
              markerShape={layer.markerShape}
              userProfileLayer={layer.userProfileLayer}
              markerDefaultColor={layer.menuColor}
              markerDefaultColor2={
                layer.markerDefaultColor2 ? layer.markerDefaultColor2 : 'RGBA(35, 31, 32, 0.2)'
              }
              itemType={layer.itemType}
              customEditLink='/edit-item'
              customEditParameter='id'
              public_edit_items={layer.public_edit_items}
              listed={layer.listed}
              api={apis.find((api) => api.id === layer.id)?.api}
            >
              <PopupView>
                {layer.itemType.show_start_end && <StartEndView></StartEndView>}
                {layer.itemType.show_profile_button && (
                  <PopupButton url={'/item'} parameterField={'id'} text={'Profile'} />
                )}
                {layer.itemType.show_text && <TextView truncate></TextView>}
              </PopupView>
              <PopupForm>
                {layer.itemType.show_name_input && (
                  <PopupTextInput dataField='name' placeholder='Name'></PopupTextInput>
                )}
                {layer.itemType.show_start_end_input && <PopupStartEndInput></PopupStartEndInput>}
                {layer.itemType.show_text_input && (
                  <div className='mt-4'>
                    <PopupTextAreaInput
                      dataField='text'
                      placeholder={'Text ...'}
                      style='tw-h-40'
                    ></PopupTextAreaInput>
                  </div>
                )}
                {
                  // layer.public_edit_items && <PopupCheckboxInput dataField={'public_edit'} label={'public edit'}/>
                }
                {layer.itemType.custom_text && (
                  <div className='flex justify-center'>
                    <p>{layer.itemType.custom_text}</p>
                  </div>
                )}
                {layer.item_presets &&
                  Object.entries(layer.item_presets).map((ip: any) => (
                    <input key={ip[0]} type='hidden' id={ip[0]} name={ip[0]} value={ip[1]} />
                  ))}
              </PopupForm>
            </Layer>
          ))}
      </UtopiaMap>
    </>
  )
}

export default MapContainer
