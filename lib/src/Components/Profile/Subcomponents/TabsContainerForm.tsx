import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { ContactInfoForm } from '#components/Profile/Subcomponents/ContactInfoForm'
import { CrowdfundingForm } from '#components/Profile/Subcomponents/CrowdfundingForm'
import { GalleryForm } from '#components/Profile/Subcomponents/GalleryForm'
import { GroupSubheaderForm } from '#components/Profile/Subcomponents/GroupSubheaderForm'
import { ProfileStartEndForm } from '#components/Profile/Subcomponents/ProfileStartEndForm'
import { ProfileTextForm } from '#components/Profile/Subcomponents/ProfileTextForm'
import { ProfileTagsForm } from '#components/Profile/Subcomponents/ProfileTagsForm'

import type { FormState } from '#types/FormState'
import type { Item } from '#types/Item'
import type { Key } from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ComponentMap = Record<string, React.ComponentType<any>>

const componentMap: ComponentMap = {
  groupSubheaders: GroupSubheaderForm,
  texts: ProfileTextForm,
  contactInfos: ContactInfoForm,
  startEnd: ProfileStartEndForm,
  crowdfundings: CrowdfundingForm,
  gallery: GalleryForm,
  inviteLinks: () => null,
  relations: () => null, // Relations are not editable in form
  tags_component: ProfileTagsForm,
  attestations_component: () => null, // Attestations are view-only
}

interface TabItem {
  id: string
  title: string
  icon?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: Array<{ collection: string; id: Key | null | undefined; item: any }>
}

interface Props {
  item: Item
  state: FormState
  setState: React.Dispatch<React.SetStateAction<FormState>>
  tabs: TabItem[]
  icon_as_labels?: boolean
}

export const TabsContainerForm = ({
  item,
  state,
  setState,
  tabs,
  icon_as_labels = false,
}: Props) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<number>(0)

  const tabsLength = tabs?.length ?? 0

  useEffect(() => {
    if (!tabs || tabs.length === 0) return

    const params = new URLSearchParams(location.search)
    const urlTab = params.get('tab')
    if (urlTab !== null && !isNaN(Number(urlTab))) {
      const index = Number(urlTab)
      if (index >= 0 && index < tabs.length) {
        setActiveTab(index)
      }
    }
  }, [tabs, tabsLength, location.search])

  const updateActiveTab = useCallback(
    (index: number) => {
      setActiveTab(index)
      const params = new URLSearchParams(location.search)
      params.set('tab', `${index}`)
      const newUrl = location.pathname + '?' + params.toString()
      navigate(newUrl, { replace: false })
    },
    [location.pathname, location.search, navigate],
  )

  if (!tabs || tabs.length === 0) {
    return null
  }

  return (
    <div className='tw:flex tw:flex-col tw:flex-1 tw:min-h-0'>
      {/* Tabs */}
      <div className='tw:flex tw:bg-base-200 tw:rounded-lg tw:p-1 tw:mb-4 tw:flex-none'>
        {tabs.map((tab, index) => (
          <button
            type="button"
            key={tab.id}
            className={`tw:flex-1 tw:flex tw:items-center tw:justify-center tw:gap-2 tw:py-2 tw:px-4 tw:rounded-md tw:transition-colors tw:cursor-pointer ${activeTab === index ? 'tw:bg-primary tw:text-primary-content' : 'hover:tw:bg-base-300'}`}
            onClick={() => updateActiveTab(index)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                updateActiveTab(index)
              }
            }}
          >
            {tab.icon && <span>{tab.icon}</span>}
            {!(icon_as_labels && activeTab !== index) && <span>{tab.title}</span>}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className='tw:flex-1 tw:flex tw:flex-col tw:min-h-0'>
        {tabs[activeTab]?.items.map((templateItem) => {
          const TemplateComponent = componentMap[templateItem.collection]
          return TemplateComponent ? (
            <TemplateComponent
              key={templateItem.id}
              item={item}
              state={state}
              setState={setState}
              {...templateItem.item}
            />
          ) : (
            <div className='tw:mt-2 tw:flex-none' key={templateItem.id}>
              {templateItem.collection} form not found
            </div>
          )
        })}
      </div>
    </div>
  )
}
