/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import FlagIcon from '@heroicons/react/24/outline/FlagIcon'
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon'
import axios from 'axios'
import { LatLng, LatLngBounds, marker } from 'leaflet'
import { useRef, useState } from 'react'
import SVG from 'react-inlinesvg'
import { useMap, useMapEvents } from 'react-leaflet'
import { useNavigate } from 'react-router-dom'

import { useAppState } from '#components/AppShell/hooks/useAppState'
import { useDebounce } from '#components/Map/hooks/useDebounce'
import { useAddFilterTag } from '#components/Map/hooks/useFilter'
import { useItems } from '#components/Map/hooks/useItems'
import { useLeafletRefs } from '#components/Map/hooks/useLeafletRefs'
import { useTags } from '#components/Map/hooks/useTags'
import useWindowDimensions from '#components/Map/hooks/useWindowDimension'
import { decodeTag } from '#utils/FormatTags'
import MarkerIconFactory from '#utils/MarkerIconFactory'

import { LocateControl } from './LocateControl'
import { SidebarControl } from './SidebarControl'

import type { Item } from '#types/Item'

export const SearchControl = () => {
  const windowDimensions = useWindowDimensions()
  const [popupOpen, setPopupOpen] = useState(false)

  const [value, setValue] = useState('')
  const [geoResults, setGeoResults] = useState<any[]>([])
  const [tagsResults, setTagsResults] = useState<any[]>([])
  const [itemsResults, setItemsResults] = useState<Item[]>([])
  const [hideSuggestions, setHideSuggestions] = useState(true)

  const map = useMap()
  const tags = useTags()
  const items = useItems()
  const leafletRefs = useLeafletRefs()
  const addFilterTag = useAddFilterTag()
  const appState = useAppState()

  useMapEvents({
    popupopen: () => {
      setPopupOpen(true)
    },
    popupclose: () => {
      setPopupOpen(false)
    },
  })

  const navigate = useNavigate()

  useDebounce(
    () => {
      const searchGeo = async () => {
        try {
          const { data } = await axios.get(`https://photon.komoot.io/api/?q=${value}&limit=5`)
          setGeoResults(data.features)
          // eslint-disable-next-line no-catch-all/no-catch-all
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log(error)
        }
      }
      searchGeo()
      setItemsResults(
        items.filter((item) => {
          return (
            value.length > 2 &&
            ((item.layer?.listed && item.name?.toLowerCase().includes(value.toLowerCase())) ||
              item.text?.toLowerCase().includes(value.toLowerCase()))
          )
        }),
      )
      let phrase = value
      if (value.startsWith('#')) phrase = value.substring(1)
      setTagsResults(tags.filter((tag) => tag.name.toLowerCase().includes(phrase.toLowerCase())))
    },
    500,
    [value],
  )

  const hide = async () => {
    setTimeout(() => {
      setHideSuggestions(true)
    }, 200)
  }

  const searchInput = useRef<HTMLInputElement>(null)

  return (
    <>
      {!(windowDimensions.height < 500 && popupOpen && hideSuggestions) && (
        <div className='tw:w-[calc(100vw-2rem)] tw:max-w-[22rem] '>
          <div className='tw:flex tw:flex-row'>
            {appState.embedded && <SidebarControl />}
            <div className='tw:relative tw:shrink tw:max-w-69 tw:w-full'>
              <input
                type='text'
                placeholder='search ...'
                autoComplete='off'
                value={value}
                className='tw:input tw:input-bordered tw:h-12 tw:grow tw:shadow-xl tw:rounded-box tw:pr-12 tw:w-full'
                data-cy='search-input'
                ref={searchInput}
                onChange={(e) => setValue(e.target.value)}
                onFocus={() => {
                  setHideSuggestions(false)
                  if (windowDimensions.width < 500) map.closePopup()
                }}
                onBlur={() => hide()}
              />
              {value.length > 0 && (
                <button
                  className='tw:btn tw:btn-sm tw:btn-circle tw:absolute tw:right-2 tw:top-2'
                  data-cy='search-clear-button'
                  onClick={() => setValue('')}
                >
                  ✕
                </button>
              )}
            </div>
            <LocateControl />
          </div>
          {hideSuggestions ||
          (Array.from(geoResults).length === 0 &&
            itemsResults.length === 0 &&
            tagsResults.length === 0 &&
            !isGeoCoordinate(value)) ||
          value.length === 0 ? (
            ''
          ) : (
            <div
              className='tw:card tw:card-body tw:bg-base-100 tw:p-4 tw:mt-2 tw:shadow-xl tw:overflow-y-auto tw:max-h-[calc(100dvh-152px)] tw:absolute tw:z-3000 tw:w-83'
              data-cy='search-suggestions'
            >
              {tagsResults.length > 0 && (
                <div className='tw:flex tw:flex-wrap'>
                  {tagsResults.slice(0, 3).map((tag) => (
                    <div
                      key={tag.name}
                      className='tw:rounded-2xl tw:text-white tw:p-1 tw:px-4 tw:shadow-md tw:card tw:mr-2 tw:mb-2 tw:cursor-pointer'
                      data-cy='search-tag-result'
                      style={{ backgroundColor: tag.color }}
                      onClick={() => {
                        addFilterTag(tag)
                      }}
                    >
                      <b>#{decodeTag(tag.name)}</b>
                    </div>
                  ))}
                </div>
              )}

              {itemsResults.length > 0 && tagsResults.length > 0 && (
                <hr className='tw:opacity-50'></hr>
              )}
              {itemsResults.slice(0, 5).map((item) => {
                // Calculate color using the same logic as PopupView
                const itemTags =
                  item.text
                    ?.match(/#[^\s#]+/g)
                    ?.map((tag) =>
                      tags.find((t) => t.name.toLowerCase() === tag.slice(1).toLowerCase()),
                    )
                    .filter(Boolean) ?? []

                let color1 = item.layer?.markerDefaultColor ?? '#777'
                if (item.color) {
                  color1 = item.color
                } else if (itemTags[0]) {
                  color1 = itemTags[0].color
                }

                return (
                  <div
                    key={item.id}
                    className='tw:cursor-pointer tw:hover:font-bold tw:flex tw:flex-row tw:items-center tw:gap-2'
                    data-cy='search-item-result'
                    onClick={() => {
                      const marker = Object.entries(leafletRefs).find(
                        (r) => r[1].item === item,
                      )?.[1].marker
                      if (marker) {
                        navigate(`/${item.id}?${new URLSearchParams(window.location.search)}`)
                      } else {
                        navigate(
                          'item/' + item.id + '?' + new URLSearchParams(window.location.search),
                        )
                      }
                    }}
                  >
                    {item.layer?.markerIcon?.image ? (
                      <div
                        className='tw:p-1.5 tw:rounded-selector tw:text-white tw:h-7 tw:w-7 tw:flex tw:items-center tw:justify-center tw:flex-shrink-0 tw:overflow-hidden'
                        style={{ backgroundColor: color1 }}
                        data-cy='search-item-icon'
                      >
                        <SVG
                          src={appState.assetsApi.url + item.layer.markerIcon.image}
                          className='tw:text-current tw:max-w-full tw:max-h-full'
                          style={{
                            width: `${item.layer.markerIcon.size ?? 18}px`,
                            height: `${item.layer.markerIcon.size ?? 18}px`,
                          }}
                          preProcessor={(code: string): string => {
                            code = code.replace(/fill=".*?"/g, 'fill="currentColor"')
                            code = code.replace(/stroke=".*?"/g, 'stroke="currentColor"')
                            return code
                          }}
                        />
                      </div>
                    ) : (
                      <div
                        className='tw:w-7 tw:h-7 tw:flex-shrink-0'
                        data-cy='search-item-icon-placeholder'
                      />
                    )}
                    <div className='tw:flex tw:flex-col tw:min-w-0'>
                      <div className='tw:text-sm tw:font-bold tw:overflow-hidden tw:text-ellipsis tw:whitespace-nowrap'>
                        {item.name}
                      </div>
                      <div className='tw:text-xs tw:overflow-hidden tw:text-ellipsis tw:whitespace-nowrap'>
                        {item.text}
                      </div>
                    </div>
                  </div>
                )
              })}
              {Array.from(geoResults).length > 0 &&
                (itemsResults.length > 0 || tagsResults.length > 0) && (
                  <hr className='tw:opacity-50'></hr>
                )}
              {Array.from(geoResults).map((geo) => (
                <div
                  className='tw:flex tw:flex-row tw:items-center tw:hover:font-bold tw:cursor-pointer tw:gap-2'
                  data-cy='search-geo-result'
                  key={Math.random()}
                  onClick={() => {
                    searchInput.current?.blur()
                    const geoMarker = marker(
                      new LatLng(geo.geometry.coordinates[1], geo.geometry.coordinates[0]),
                      {
                        icon: MarkerIconFactory('circle', '#777', 'RGBA(35, 31, 32, 0.2)'),
                      },
                    )
                      .addTo(map)
                      .bindPopup(
                        `<h3 class="tw:text-base tw:font-bold">${geo?.properties.name ? geo?.properties.name : value}<h3>${capitalizeFirstLetter(geo?.properties?.osm_value)}`,
                      )
                      .addEventListener('popupclose', (e) => {
                        // eslint-disable-next-line no-console
                        console.log(e.target.remove())
                      })

                    // Open popup after map finishes moving to ensure it's visible
                    const openPopupAfterMove = () => {
                      geoMarker.openPopup()
                      map.off('moveend', openPopupAfterMove)
                    }
                    map.on('moveend', openPopupAfterMove)

                    if (geo.properties.extent)
                      map.fitBounds(
                        new LatLngBounds(
                          new LatLng(geo.properties.extent[1], geo.properties.extent[0]),
                          new LatLng(geo.properties.extent[3], geo.properties.extent[2]),
                        ),
                      )
                    else
                      map.setView(
                        new LatLng(geo.geometry.coordinates[1], geo.geometry.coordinates[0]),
                        15,
                        { duration: 1 },
                      )
                    hide()
                  }}
                >
                  <div className='tw:h-7 tw:w-7 tw:flex tw:items-center tw:justify-center tw:flex-shrink-0'>
                    <MapPinIcon
                      className='tw:text-current tw:w-5 tw:h-5'
                      data-cy='search-geo-icon'
                    />
                  </div>
                  <div className='tw:flex tw:flex-col tw:min-w-0'>
                    <div
                      className='tw:text-sm tw:font-bold tw:overflow-hidden tw:text-ellipsis tw:whitespace-nowrap'
                      data-cy='search-geo-name'
                    >
                      {geo?.properties.name ? geo?.properties.name : value}
                    </div>
                    <div
                      className='tw:text-xs tw:overflow-hidden tw:text-ellipsis tw:whitespace-nowrap'
                      data-cy='search-geo-details'
                    >
                      {geo?.properties?.city && `${capitalizeFirstLetter(geo?.properties?.city)}, `}{' '}
                      {geo?.properties?.osm_value &&
                        geo?.properties?.osm_value !== 'yes' &&
                        geo?.properties?.osm_value !== 'primary' &&
                        geo?.properties?.osm_value !== 'path' &&
                        geo?.properties?.osm_value !== 'secondary' &&
                        geo?.properties?.osm_value !== 'residential' &&
                        geo?.properties?.osm_value !== 'unclassified' &&
                        `${capitalizeFirstLetter(geo?.properties?.osm_value)}, `}{' '}
                      {geo.properties.state && `${geo.properties.state}, `}{' '}
                      {geo.properties.country && geo.properties.country}
                    </div>
                  </div>
                </div>
              ))}
              {isGeoCoordinate(value) && (
                <div
                  className='tw:flex tw:flex-row tw:items-center tw:hover:font-bold tw:cursor-pointer tw:gap-2'
                  data-cy='search-coordinate-result'
                  onClick={() => {
                    const coords = extractCoordinates(value)!
                    const coordMarker = marker(new LatLng(coords[0], coords[1]), {
                      icon: MarkerIconFactory('circle', '#777', 'RGBA(35, 31, 32, 0.2)'),
                    })
                      .addTo(map)
                      .bindPopup(
                        `<h3 class="tw:text-base tw:font-bold">${coords[0]}, ${coords[1]}</h3>`,
                      )
                      .addEventListener('popupclose', (e) => {
                        // eslint-disable-next-line no-console
                        console.log(e.target.remove())
                      })

                    // Open popup after map finishes moving to ensure it's visible
                    const openPopupAfterMove = () => {
                      coordMarker.openPopup()
                      map.off('moveend', openPopupAfterMove)
                    }
                    map.on('moveend', openPopupAfterMove)

                    map.setView(new LatLng(coords[0], coords[1]), 15, { duration: 1 })
                  }}
                >
                  <div className='tw:h-7 tw:w-7 tw:flex tw:items-center tw:justify-center tw:flex-shrink-0'>
                    <FlagIcon
                      className='tw:text-current tw:w-5 tw:h-5'
                      data-cy='search-coordinate-icon'
                    />
                  </div>
                  <div className='tw:flex tw:flex-col tw:min-w-0'>
                    <div
                      className='tw:text-sm tw:font-bold tw:overflow-hidden tw:text-ellipsis tw:whitespace-nowrap'
                      data-cy='search-coordinate-text'
                    >
                      {value}
                    </div>
                    <div
                      className='tw:text-xs tw:overflow-hidden tw:text-ellipsis tw:whitespace-nowrap'
                      data-cy='search-coordinate-label'
                    >
                      {'Coordiante'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  )
}

function isGeoCoordinate(input) {
  const geokoordinatenRegex =
    // eslint-disable-next-line security/detect-unsafe-regex
    /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/
  return geokoordinatenRegex.test(input)
}

function extractCoordinates(input): number[] | null {
  const result = input.split(',')
  if (result) {
    const latitude = parseFloat(result[0])
    const longitude = parseFloat(result[1])
    if (!isNaN(latitude) && !isNaN(longitude)) {
      return [latitude, longitude]
    }
  }
  return null // Invalid input or error
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}
