/* eslint-disable security/detect-object-injection */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

interface TabItem {
  title: string
  component: React.ReactNode
}

interface TabsProps {
  items: TabItem[]
  setUrlParams: (params: URLSearchParams) => void
}

export const Tabs: React.FC<TabsProps> = ({ items, setUrlParams }: TabsProps) => {
  const location = useLocation()
  const navigate = useNavigate()

  const [activeIndex, setActiveIndex] = useState<number>(0)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const urlTab = params.get('tab')
    if (urlTab !== null && !isNaN(Number(urlTab))) {
      const index = Number(urlTab)
      if (index >= 0 && index < items.length) {
        setActiveIndex(index)
      }
    }
  }, [items.length, location.search])

  const updateActiveTab = useCallback(
    (index: number) => {
      setActiveIndex(index)

      const params = new URLSearchParams(location.search)
      params.set('tab', `${index}`)
      setUrlParams(params)
      const newUrl = location.pathname + '?' + params.toString()

      void navigate(newUrl, { replace: false })
    },
    [location.pathname, location.search, navigate, setUrlParams],
  )

  return (
    <div className='tw:flex tw:flex-col tw:flex-1 tw:min-h-0'>
      <div role='tablist' className='tw:tabs tw:tabs-lift tw:flex-none'>
        {items.map((item, index) => (
          <div
            key={index}
            role='tab'
            className={`tw:tab ${index === activeIndex ? 'tw:tab-active' : ''}`}
            onClick={() => {
              updateActiveTab(index)
            }}
          >
            {item.title}
          </div>
        ))}
      </div>
      <div className='tw:flex-1 tw:flex tw:flex-col tw:min-h-0'>
        {items[activeIndex]?.component}
      </div>
    </div>
  )
}
