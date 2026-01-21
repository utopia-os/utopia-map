import { ComponentErrorBoundary } from '#components/Profile/ComponentErrorBoundary'
import { formComponentMap } from '#components/Profile/componentMaps'

import type { FormState } from '#types/FormState'
import type { Item } from '#types/Item'

export const FlexForm = ({
  item,
  state,
  setState,
}: {
  state: FormState
  setState: React.Dispatch<React.SetStateAction<FormState>>
  item: Item
}) => {
  return (
    <div className='tw:mt-6 tw:flex tw:flex-col tw:flex-1 tw:min-h-0'>
      {item.layer?.itemType.profileTemplate.map((templateItem) => {
        const TemplateComponent = formComponentMap[templateItem.collection]
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Key may not exist in map
        return TemplateComponent ? (
          <ComponentErrorBoundary
            key={templateItem.id}
            componentName={String(templateItem.collection)}
          >
            <TemplateComponent
              state={state}
              setState={setState}
              item={item}
              {...templateItem.item}
            />
          </ComponentErrorBoundary>
        ) : (
          <div className='tw:mt-2 tw:flex-none' key={templateItem.id}>
            {templateItem.collection} form not found
          </div>
        )
      })}
    </div>
  )
}
