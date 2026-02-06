import { useState } from 'react'
import { RowsPhotoAlbum } from 'react-photo-album'
import ReactLightbox from 'yet-another-react-lightbox'

import { useAppState } from '#components/AppShell/hooks/useAppState'

import type { Item } from '#types/Item'

const extensionMap = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
])

const getExtension = (type: string) => {
  const extension = extensionMap.get(type)

  if (extension) return extension

  throw new Error(`Unsupported file type: ${type}`)
}

export const GalleryView = ({ item }: { item: Item }) => {
  const [index, setIndex] = useState(-1)
  const appState = useAppState()
  const images =
    item.gallery?.flatMap((g, index) => {
      if (!g.directus_files_id) return []
      const file = g.directus_files_id
      if (typeof file === 'string') return []
      const { id, type, width, height } = file
      return [
        {
          src: `${appState.assetsApi.url}${id}${getExtension(type)}`,
          width,
          height,
          index,
        },
      ]
    }) ?? []

  if (images.length > 0)
    return (
      <div className=''>
        <RowsPhotoAlbum
          photos={images}
          targetRowHeight={150}
          onClick={({ index: current }) => {
            setIndex(current)
          }}
        />

        <ReactLightbox
          index={index}
          slides={images}
          open={index >= 0}
          close={() => {
            setIndex(-1)
          }}
        />
      </div>
    )
  else return <></>
}
