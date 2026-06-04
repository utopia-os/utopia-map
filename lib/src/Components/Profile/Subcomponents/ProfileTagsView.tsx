import { useAddFilterTag } from '#components/Map/hooks/useFilter'
import { useTags } from '#components/Map/hooks/useTags'
import { TagView } from '#components/Templates/TagView'

import type { Item } from '#types/Item'
import type { Tag } from '#types/Tag'

interface Props {
  item: Item
  dataField: 'offers' | 'needs'
  heading?: string
  hideWhenEmpty?: boolean
}

export const ProfileTagsView = ({ item, dataField, heading, hideWhenEmpty = true }: Props) => {
  const addFilterTag = useAddFilterTag()
  const allTags = useTags()

  // Get the tag IDs from the item based on dataField
  // eslint-disable-next-line security/detect-object-injection
  const rawTagRelations = item[dataField]

  // Validate that tagRelations is an array
  const tagRelations = Array.isArray(rawTagRelations) ? rawTagRelations : []

  // Resolve tag IDs to full Tag objects, filtering out malformed entries
  const tags: Tag[] = tagRelations.reduce((acc: Tag[], relation) => {
    // Skip if relation is missing tags_id (runtime validation for external data)
    if (typeof relation !== 'object' || !('tags_id' in relation)) {
      return acc
    }
    const tag = allTags.find((t) => t.id === relation.tags_id)
    if (tag) acc.push(tag)
    return acc
  }, [])

  if (hideWhenEmpty && tags.length === 0) {
    return null
  }

  const defaultHeading = dataField === 'offers' ? 'Offers' : 'Needs'

  return (
    <div>
      <h2 className='tw:text-lg tw:font-bold tw:-mb-2'>{heading ?? defaultHeading}</h2>
      <div className='tw:flex tw:flex-wrap tw:mb-4'>
        {tags.map((tag) => (
          <TagView
            key={tag.id}
            tag={tag}
            onClick={() => {
              addFilterTag(tag)
            }}
          />
        ))}
      </div>
    </div>
  )
}
