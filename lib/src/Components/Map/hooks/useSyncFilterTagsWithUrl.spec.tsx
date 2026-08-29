import { render, screen, act } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, beforeEach } from 'vitest'

import { TagsControl } from '#components/Map/Subcomponents/Controls/TagsControl'

import { FilterProvider } from './useFilter'
import { useSyncFilterTagsWithUrl } from './useSyncFilterTagsWithUrl'

import type { Tag } from '#types/Tag'

const TAGS = [
  { id: '1', name: 'garten', color: '#2E7D32' },
  { id: '2', name: 'baum', color: '#7E57C2' },
] as unknown as Tag[]

const Bed = () => {
  useSyncFilterTagsWithUrl(TAGS)
  return <TagsControl />
}

const renderAt = (search: string) => {
  window.history.replaceState({}, '', `/${search}`)
  return render(
    <BrowserRouter>
      <FilterProvider initialTags={[]}>
        <Bed />
      </FilterProvider>
    </BrowserRouter>,
  )
}

const chips = () => screen.queryAllByText(/^#/).map((e) => e.textContent)
const urlTags = () => new URLSearchParams(window.location.search).get('tags')

const clickRemove = (index = 0) => {
  act(() => {
    screen.getAllByText('✕').at(index)?.click()
  })
}

describe('useSyncFilterTagsWithUrl', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/')
  })

  it('picks up the tags from the url', () => {
    renderAt('?tags=garten')
    expect(chips()).toEqual(['#Garten'])
  })

  it('picks up several tags from the url', () => {
    renderAt('?tags=garten;baum')
    expect(chips()).toEqual(['#Garten', '#Baum'])
  })

  it('keeps a removed tag removed', () => {
    renderAt('?tags=garten')
    expect(chips()).toEqual(['#Garten'])

    clickRemove()

    expect(chips()).toEqual([])
    expect(urlTags()).toBeNull()
  })

  it('keeps the remaining tag when one of two is removed', () => {
    renderAt('?tags=garten;baum')
    expect(chips()).toEqual(['#Garten', '#Baum'])

    clickRemove(0)

    expect(chips()).toEqual(['#Baum'])
    expect(urlTags()).toBe('baum')
  })
})
