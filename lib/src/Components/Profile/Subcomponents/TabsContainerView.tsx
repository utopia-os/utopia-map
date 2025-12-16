import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { AttestationsView } from '#components/Profile/Subcomponents/AttestationsView'
import { ContactInfoView } from '#components/Profile/Subcomponents/ContactInfoView'
import { CrowdfundingView } from '#components/Profile/Subcomponents/CrowdfundingView'
import { GalleryView } from '#components/Profile/Subcomponents/GalleryView'
import { GroupSubHeaderView } from '#components/Profile/Subcomponents/GroupSubHeaderView'
import { InviteLinkView } from '#components/Profile/Subcomponents/InviteLinkView'
import { ProfileStartEndView } from '#components/Profile/Subcomponents/ProfileStartEndView'
import { ProfileTagsView } from '#components/Profile/Subcomponents/ProfileTagsView'
import { ProfileTextView } from '#components/Profile/Subcomponents/ProfileTextView'
import { RelationsView } from '#components/Profile/Subcomponents/RelationsView'

import type { Item } from '#types/Item'
import type { Key } from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ComponentMap = Record<string, React.ComponentType<any>>

const componentMap: ComponentMap = {
  groupSubheaders: GroupSubHeaderView,
  texts: ProfileTextView,
  contactInfos: ContactInfoView,
  startEnd: ProfileStartEndView,
  gallery: GalleryView,
  crowdfundings: CrowdfundingView,
  inviteLinks: InviteLinkView,
  relations: RelationsView,
  tags_component: ProfileTagsView,
  attestations_component: AttestationsView,
}

interface TabItem {
  id: string
  title: string
  icon?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: { collection: string; id: Key | null | undefined; item: any }[]
}

interface Props {
  item: Item
  tabs: TabItem[]
  iconAsLabels?: boolean
}

export const TabsContainerView = ({ item, tabs = [], iconAsLabels = false }: Props) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<number>(0)

  const tabsLength = tabs.length

  useEffect(() => {
    if (tabs.length === 0) return

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
      navigate(newUrl)
    },
    [location.pathname, location.search, navigate],
  )

  if (tabs.length === 0) {
    return null
  }

  return (
    <div>
      {/* Tabs */}
      <div className='tw:flex tw:bg-base-200 tw:rounded-lg tw:p-1 tw:mb-4'>
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            className={`tw:flex-1 tw:flex tw:items-center tw:justify-center tw:gap-2 tw:py-2 tw:px-4 tw:rounded-md tw:transition-colors tw:cursor-pointer ${activeTab === index ? 'tw:bg-primary tw:text-primary-content' : 'hover:tw:bg-base-300'}`}
            onClick={() => updateActiveTab(index)}
          >
            {tab.icon && <span>{tab.icon}</span>}
            {!(iconAsLabels && activeTab !== index) && <span>{tab.title}</span>}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className='tw:overflow-y-auto fade tw:pb-4 tw:overflow-x-hidden'>
        {/* eslint-disable-next-line security/detect-object-injection */}
        {tabs[activeTab].items.map((templateItem) => {
          const TemplateComponent = componentMap[templateItem.collection]
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          return TemplateComponent ? (
            <TemplateComponent key={templateItem.id} item={item} {...templateItem.item} />
          ) : (
            <div className='tw:mb-6' key={templateItem.id}>
              {templateItem.collection} view not found
            </div>
          )
        })}
      </div>
    </div>
  )
}
