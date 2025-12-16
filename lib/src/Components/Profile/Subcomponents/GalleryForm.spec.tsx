/* eslint-disable camelcase */ // Directus database fields use snake_case
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { readFileSync } from 'node:fs'
import path from 'node:path'

import { render, fireEvent, screen } from '@testing-library/react'
import { describe, it, vi, expect } from 'vitest'

import { GalleryForm } from './GalleryForm'

import type { FormState } from '#types/FormState'
import type { GalleryItem, Item } from '#types/Item'
import type { MarkerIcon } from '#types/MarkerIcon'
import type { Tag } from '#types/Tag'

const testImagePaths = ['./tests/image1.jpg', './tests/image2.jpg', './tests/image3.jpg']

const testImages = testImagePaths.map((imagePath) =>
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  readFileSync(path.join(__dirname, '../../../../', imagePath)),
)

const setState = vi.fn()

const baseState = {
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
}

describe('GalleryForm', () => {
  const Wrapper = ({ gallery = [] as GalleryItem[], uploadingImages = [] as File[] } = {}) => {
    const state: FormState = {
      ...baseState,
      gallery,
      uploadingImages,
    }
    return render(<GalleryForm state={state} setState={setState} />)
  }

  describe('without previous images', () => {
    it('renders', () => {
      const wrapper = Wrapper()
      expect(wrapper.container).toMatchSnapshot()
    })
  })

  describe('with previous images', () => {
    const gallery = [
      {
        directus_files_id: {
          id: '1',
          width: 800,
          height: 600,
          type: 'image/jpeg',
        },
      },
      {
        directus_files_id: {
          id: '2',
          width: 1024,
          height: 768,
          type: 'image/jpeg',
        },
      },
    ]

    it('renders', () => {
      const wrapper = Wrapper({ gallery })
      expect(wrapper.container).toMatchSnapshot()
    })

    it('can open and close delete modal', () => {
      Wrapper({ gallery })
      const deleteButton = screen.getAllByTestId('trash')[0]
      expect(deleteButton).toBeInTheDocument()
      fireEvent.click(deleteButton)
      const confirmationText = screen.getByText('Do you want to delete this image?')
      expect(confirmationText).toBeInTheDocument()
      const confirmButton = screen.getByText('Yes')
      expect(confirmButton).toBeInTheDocument()
      fireEvent.click(confirmButton)
      expect(confirmationText).not.toBeInTheDocument()
    })
  })

  describe('with uploading images', () => {
    it('renders', () => {
      const wrapper = Wrapper({
        uploadingImages: testImages.map(
          (image, index) =>
            new File([image], `test-image-${index + 1}.jpg`, { type: 'image/jpeg' }),
        ),
      })
      wrapper.container.querySelectorAll('img').forEach((img) => {
        expect(img.src).toMatch(/blob:/) // Ensure the image is a blob URL
        // Replace random blob URL for consistent snapshots
        img.src = 'blob-url-placeholder'
      })
      expect(wrapper.container).toMatchSnapshot()
    })
  })
})
