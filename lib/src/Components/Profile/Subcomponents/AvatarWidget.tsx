/* eslint-disable react/prop-types */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import ArrowUpTrayIcon from '@heroicons/react/24/outline/ArrowUpTrayIcon'
import { useState, useCallback, useRef } from 'react'
import { ReactCrop, centerCrop, makeAspectCrop } from 'react-image-crop'

import UserSVG from '#assets/user.svg'
import { useAppState } from '#components/AppShell/hooks/useAppState'
import DialogModal from '#components/Templates/DialogModal'

import type { Item } from '#types/Item'
import type { Crop } from 'react-image-crop'

interface AvatarWidgetProps {
  avatar?: string
  setAvatar: React.Dispatch<React.SetStateAction<any>>
  item?: Item
}

export const AvatarWidget: React.FC<AvatarWidgetProps> = ({ avatar, setAvatar, item }) => {
  const [crop, setCrop] = useState<Crop>()
  const [image, setImage] = useState<string>('')
  const [cropModalOpen, setCropModalOpen] = useState<boolean>(false)
  const [cropping, setCropping] = useState<boolean>(false)

  const appState = useAppState()

  const imgRef = useRef<HTMLImageElement>(null)

  const onImageChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0]
    if (file) {
      const validFormats = ['image/jpeg', 'image/png']
      const maxSizeMB = 10
      const maxSizeBytes = maxSizeMB * 1024 * 1024

      if (!validFormats.includes(file.type)) {
        alert('Unsupported file format. Please upload a JPEG or PNG image.')
        return
      }

      if (file.size > maxSizeBytes) {
        alert(`File size exceeds ${maxSizeMB}MB. Please upload a smaller image.`)
        return
      }

      setImage(URL.createObjectURL(file))
      setCropModalOpen(true)
    } else {
      alert('No file selected or an error occurred while selecting the file.')
    }
  }, [])

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    setCrop(centerAspectCrop(width, height, 1))
  }, [])

  const centerAspectCrop = (mediaWidth: number, mediaHeight: number, aspect: number) => {
    return centerCrop(
      makeAspectCrop(
        {
          unit: 'px',
          width: mediaWidth / 2,
        },
        aspect,
        mediaWidth,
        mediaHeight,
      ),
      mediaWidth,
      mediaHeight,
    )
  }

  async function resizeImage(
    image: HTMLImageElement,
    maxWidth: number,
    maxHeight: number,
  ): Promise<HTMLImageElement> {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    let width = image.width
    let height = image.height

    if (width > maxWidth) {
      height *= maxWidth / width
      width = maxWidth
    }
    if (height > maxHeight) {
      width *= maxHeight / height
      height = maxHeight
    }

    canvas.width = width
    canvas.height = height

    if (ctx) {
      ctx.drawImage(image, 0, 0, width, height)
    }

    const resizedImage = new Image()
    resizedImage.src = canvas.toDataURL()

    await resizedImage.decode()
    return resizedImage
  }

  const renderCrop = useCallback(async () => {
    const image = imgRef.current
    if (crop && image) {
      const resizedImage = await resizeImage(image, 1024, 1024) // Bildgröße vor dem Zuschneiden reduzieren
      const scaleX = resizedImage.naturalWidth / resizedImage.width
      const scaleY = resizedImage.naturalHeight / resizedImage.height

      const canvas = new OffscreenCanvas(crop.width * scaleX, crop.height * scaleY)
      const ctx = canvas.getContext('2d')
      const pixelRatio = window.devicePixelRatio
      canvas.width = crop.width * pixelRatio * scaleX
      canvas.height = crop.height * pixelRatio * scaleY

      if (ctx) {
        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
        ctx.drawImage(
          resizedImage,
          crop.x * scaleX,
          crop.y * scaleY,
          crop.width * scaleX,
          crop.height * scaleY,
          0,
          0,
          crop.width * scaleX,
          crop.height * scaleY,
        )
      }

      const blob = await canvas.convertToBlob()
      await resizeBlob(blob)
      setCropping(false)
      setImage('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crop])

  const resizeBlob = useCallback(
    async (blob: Blob) => {
      const img = new Image()
      img.src = URL.createObjectURL(blob)
      await img.decode()

      const canvas = new OffscreenCanvas(400, 400)
      const ctx = canvas.getContext('2d')
      ctx?.drawImage(img, 0, 0, 400, 400)

      const resizedBlob = await canvas.convertToBlob()
      const asset = await appState.assetsApi.upload(resizedBlob, 'avatar')
      setAvatar(asset.id)
    },
    [appState.assetsApi, setAvatar],
  )

  return (
    <>
      {!cropping ? (
        <label className='custom-file-upload'>
          <input
            type='file'
            accept='image/*'
            className='tw:file-input tw:w-full tw:max-w-xs'
            onChange={onImageChange}
          />
          <div className='button tw:btn tw:btn-lg tw:btn-circle tw:animate-none'>
            <ArrowUpTrayIcon className='tw:w-6 tw:h-6' />
          </div>
          {avatar ? (
            <div className='tw:h-20 tw:w-20'>
              <img
                src={appState.assetsApi.url + avatar}
                className='tw:h-20 tw:w-20 tw:rounded-full'
              />
            </div>
          ) : (
            <div className='tw:h-20 tw:w-20'>
              <img src={item?.image_external ?? UserSVG} className='tw:rounded-full'></img>
            </div>
          )}
        </label>
      ) : (
        <div className='tw:w-20 tw:flex tw:items-center tw:justify-center'>
          <span className='tw:loading tw:loading-spinner'></span>
        </div>
      )}
      <DialogModal
        title=''
        isOpened={cropModalOpen}
        onClose={() => {
          setCropModalOpen(false)
          setImage('')
        }}
        closeOnClickOutside={false}
      >
        <ReactCrop
          crop={crop}
          onChange={(c) => {
            setCrop(c)
          }}
          aspect={1}
        >
          <img src={image} ref={imgRef} onLoad={onImageLoad} />
        </ReactCrop>
        <button
          className={'tw:btn tw:btn-primary'}
          onClick={() => {
            setCropping(true)
            setCropModalOpen(false)
            renderCrop()
          }}
        >
          Select
        </button>
      </DialogModal>
    </>
  )
}
