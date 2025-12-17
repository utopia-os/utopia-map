import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { ComponentErrorBoundary } from '#components/Profile/ComponentErrorBoundary'
import { viewComponentMap } from '#components/Profile/componentMaps'

import type { Item } from '#types/Item'
import type { Key } from 'react'

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
      params.set('tab', String(index))
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
            type='button'
            key={tab.id}
            className={`tw:flex-1 tw:flex tw:items-center tw:justify-center tw:gap-2 tw:py-2 tw:px-4 tw:rounded-md tw:transition-colors tw:cursor-pointer ${activeTab === index ? 'tw:bg-primary tw:text-primary-content' : 'hover:tw:bg-base-300'}`}
            onClick={() => {
              updateActiveTab(index)
            }}
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
          const TemplateComponent = viewComponentMap[templateItem.collection]
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          return TemplateComponent ? (
            <ComponentErrorBoundary key={templateItem.id} componentName={templateItem.collection}>
              <TemplateComponent item={item} {...templateItem.item} />
            </ComponentErrorBoundary>
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
