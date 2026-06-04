import { ComponentErrorBoundary } from '#components/Profile/ComponentErrorBoundary'
import { viewComponentMap } from '#components/Profile/componentMaps'

import type { Item } from '#types/Item'
import type { Key } from 'react'

export const FlexView = ({ item }: { item: Item }) => {
  return (
    <div className='tw:h-full tw:overflow-y-auto fade tw:px-6 tw:py-4 tw:flex tw:flex-col tw:gap-4'>
      {item.layer?.itemType.profileTemplate.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (templateItem: { collection: string; id: Key | null | undefined; item: any }) => {
          const TemplateComponent = viewComponentMap[templateItem.collection]
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Key may not exist in map
          return TemplateComponent ? (
            <ComponentErrorBoundary key={templateItem.id} componentName={templateItem.collection}>
              <TemplateComponent item={item} {...templateItem.item} />
            </ComponentErrorBoundary>
          ) : (
            <div className='tw:mx-6 tw:mb-6' key={templateItem.id}>
              {templateItem.collection} view not found
            </div>
          )
        },
      )}
    </div>
  )
}
