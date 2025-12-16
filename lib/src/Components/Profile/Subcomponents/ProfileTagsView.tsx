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

export const ProfileTagsView = ({
  item,
  dataField,
  heading,
  hideWhenEmpty = true,
}: Props) => {
  const addFilterTag = useAddFilterTag()
  const allTags = useTags()

  // Get the tag IDs from the item based on dataField
  const tagRelations = item[dataField] ?? []

  // Resolve tag IDs to full Tag objects
  const tags: Tag[] = tagRelations.reduce((acc: Tag[], relation) => {
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
