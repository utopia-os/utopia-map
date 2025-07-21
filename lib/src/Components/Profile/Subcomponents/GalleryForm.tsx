import TrashIcon from '@heroicons/react/24/solid/TrashIcon'
import imageCompression from 'browser-image-compression'
import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { BiSolidImage } from 'react-icons/bi'

import { useAppState } from '#components/AppShell/hooks/useAppState'
import { InputLabel } from '#components/Input/InputLabel'
import DialogModal from '#components/Templates/DialogModal'
import { getImageDimensions } from '#utils/getImageDimensions'

import type { FormState } from '#types/FormState'

interface Props {
  state: FormState
  setState: React.Dispatch<React.SetStateAction<FormState>>
  hideInputLabel?: boolean
}

const compressionOptions = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
}

export const GalleryForm = ({ state, setState, hideInputLabel = false }: Props) => {
  const appState = useAppState()

  const [imageSelectedToDelete, setImageSelectedToDelete] = useState<number | null>(null)

  const closeModal = () => setImageSelectedToDelete(null)

  const upload = async (acceptedFiles: File[]) => {
    setState((prevState) => ({
      ...prevState,
      uploadingImages: [...prevState.uploadingImages, ...acceptedFiles],
    }))

    const uploads = acceptedFiles.map(async (file) => {
      const compressedFile = await imageCompression(file, compressionOptions)
      const { width, height } = await getImageDimensions(compressedFile)
      return {
        width,
        height,
        asset: await appState.assetsApi.upload(compressedFile, file.name),
        name: file.name,
        type: file.type,
      }
    })

    for await (const upload of uploads) {
      setState((prevState) => ({
        ...prevState,
        uploadingImages: prevState.uploadingImages.filter((f) => f.name !== upload.name),
        gallery: [
          ...prevState.gallery,
          {
            directus_files_id: {
              id: upload.asset.id,
              width: upload.width,
              height: upload.height,
              type: upload.type,
            },
          },
        ],
      }))
    }
  }

  const { getRootProps, getInputProps } = useDropzone({
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    onDrop: upload,
    accept: {
      'image/jpeg': [],
      'image/png': [],
    },
  })

  const images = state.gallery
    .map((image) => ({
      src:
        typeof image.directus_files_id !== 'string' &&
        appState.assetsApi.url + `${image.directus_files_id.id}.jpg`,
      state: 'uploaded',
    }))
    .concat(
      state.uploadingImages.map((file) => ({
        src: URL.createObjectURL(file),
        state: 'uploading',
      })),
    )

  const removeImage = (index: number) => {
    setState((prevState) => ({
      ...prevState,
      gallery: prevState.gallery.filter((_, i) => i !== index),
    }))
  }

  return (
    <div className='tw:mt-3'>
      {!hideInputLabel && <InputLabel label='Media' />}
      <div className='tw:grid tw:grid-cols-2 tw:@md:grid-cols-3 tw:@lg:grid-cols-4 tw:gap-4'>
        {images.map((image, index) => (
          <div key={index} className='tw:relative'>
            <img
              src={image.src || undefined}
              alt={`Gallery image ${index + 1}`}
              className={`tw:w-full tw:h-full tw:object-cover tw:rounded-lg ${
                image.state === 'uploading' ? 'tw:opacity-50' : ''
              }`}
            />
            {image.state === 'uploading' && (
              <span className='tw:loading tw:loading-spinner tw:absolute tw:inset-0 tw:m-auto'></span>
            )}
            {image.state === 'uploaded' && (
              <button
                className='tw:m-2 tw:bg-red-500 tw:text-white tw:p-2 tw:rounded-full tw:absolute tw:top-0 tw:right-0 tw:hover:bg-red-600 tw:cursor-pointer'
                onClick={() => setImageSelectedToDelete(index)}
                type='button'
              >
                <TrashIcon className='tw:h-5 tw:w-5' data-testid='trash' />
              </button>
            )}
          </div>
        ))}

        <div
          {...getRootProps()}
          className='tw:flex tw:flex-col tw:items-center tw:justify-center tw:text-base-content/50 tw:w-full tw:h-full tw:cursor-pointer tw:card tw:card-body tw:border tw:border-current/50 tw:border-dashed tw:bg-base-200'
        >
          <input {...getInputProps()} data-testid='gallery-upload-input' />
          <div>
            <BiSolidImage className='tw:h-16 tw:w-16 tw:m-auto tw:mb-2' />
            <span className='tw:text-center'>Upload&nbsp;Image</span>
          </div>
        </div>
      </div>
      <DialogModal
        isOpened={imageSelectedToDelete !== null}
        title='Are you sure?'
        showCloseButton={false}
        onClose={closeModal}
      >
        <div onClick={(e) => e.stopPropagation()}>
          <span>Do you want to delete this image?</span>
          <div className='tw:grid'>
            <div className='tw:flex tw:justify-between'>
              <label
                className='tw:btn tw:mt-4 tw:btn-error'
                onClick={() => {
                  if (imageSelectedToDelete !== null) {
                    removeImage(imageSelectedToDelete)
                  }
                  closeModal()
                }}
              >
                Yes
              </label>
              <label className='tw:btn tw:mt-4' onClick={closeModal}>
                No
              </label>
            </div>
          </div>
        </div>
      </DialogModal>
    </div>
  )
}
