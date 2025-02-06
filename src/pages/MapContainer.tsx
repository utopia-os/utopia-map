import { UtopiaMap, Layer, ItemView, PopupButton, StartEndView, TextView, ItemForm, PopupStartEndInput, PopupTextAreaInput, PopupTextInput } from 'utopia-ui'
import { itemsApi } from '../api/itemsApi';
import { Place } from '../api/directus';
import { useEffect, useState } from 'react';
import { LayerProps } from 'utopia-ui/dist/types';

type layerApi = {
  id: string;
  api: itemsApi<Place>
}

function MapContainer({ layers, map }: { layers: Array<LayerProps>, map: any }) {
  const [apis, setApis] = useState<Array<layerApi>>([]);

  useEffect(() => {
    // get timestamp for the end of the current day
    let now = new Date();
    let startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let etartOfDayISO = startOfDay.toISOString();

    layers.map((layer: LayerProps) => {
      apis && setApis(current => [...current, {
        id: layer.id!, api: new itemsApi<Place>('items', layer.id, undefined, {
          "_or": [
            {
              "end": {
                "_gt": etartOfDayISO
              }
            },
            {
              "end": {
                "_null": true
              }
            }
          ]
        }
        )
      }])
    })
  }, [layers])

  useEffect(() => {
  }, [apis])


  return (

    <UtopiaMap
      geo={map.geo}
      zoom={map.zoom || 5}
      center={map.center ? [map.center?.coordinates[1], map.center?.coordinates[0]] : [50.6, 9.5]}
      height='100%'
      width="100%"
      showFilterControl={map.show_filter_control}
      showLayerControl={map.show_layer_control}
      showGratitudeControl={map.show_gratitude_control}
      infoText={map.info_text}
    >
      {layers && apis &&
        layers.map(layer =>
          <Layer
            key={layer.id}
            name={layer.name}
            menuIcon={"https://api.utopia-lab.org/assets/" + layer.menuIcon}
            menuText={layer.menuText}
            menuColor={layer.menuColor}
            markerIcon={layer.markerIcon}
            markerShape={layer.markerShape}
            onlyOnePerOwner={layer.onlyOnePerOwner}
            markerDefaultColor={layer.menuColor}
            markerDefaultColor2={layer.markerDefaultColor2 ? layer.markerDefaultColor2 : "RGBA(35, 31, 32, 0.2)"}
            itemType={layer.itemType}
            customEditLink='/edit-item'
            customEditParameter='id'
            public_edit_items={layer.public_edit_items}
            listed={layer.listed}
            api={apis?.find(api => api.id === layer.id)?.api}>
            <ItemView>
              {layer.itemType.show_start_end &&
                <StartEndView></StartEndView>
              }
              {layer.itemType.show_profile_button &&
                <PopupButton url={'/item'} parameterField={'id'} text={'Profile'} colorField={'color'} />
              }
              {layer.itemType.show_text &&
                <TextView truncate></TextView>
              }
            </ItemView>
            <ItemForm>
              {layer.itemType.show_name_input && <PopupTextInput dataField='name' placeholder='Name'></PopupTextInput>}
              {layer.itemType.show_start_end_input && <PopupStartEndInput></PopupStartEndInput>}
              {layer.itemType.show_text_input && <div className='mt-4'><PopupTextAreaInput dataField='text' placeholder={'Text ...'} style="tw-h-40"></PopupTextAreaInput></div>}
              {//layer.public_edit_items && <PopupCheckboxInput dataField={'public_edit'} label={'public edit'}/>
              }
              {layer.itemType.custom_text && <div className='flex justify-center'>
                <p>{layer.itemType.custom_text}</p>
              </div>}
              {layer.item_presets && Object.entries(layer.item_presets).map((ip: any) => <input key={ip[0]} type="hidden" id={ip[0]} name={ip[0]} value={ip[1]} />)}
            </ItemForm>
          </Layer>)
      }
    </UtopiaMap>
  )
}

export default MapContainer
