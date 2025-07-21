import { useEffect, useRef, useState } from 'react'

import { TextPreview } from './TextPreview'

import type { Item } from '#types/Item'

export const LazyTextPreview = ({ item }: { item: Item }) => {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisible(true)
        observer.disconnect()
      }
    })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref}>
      {visible ? (
        <TextPreview item={item} />
      ) : (
        <div className='tw:flex tw:justify-center '>
          <div className='tw:loading tw:spinner tw:h-8 tw:opacity-50' />
        </div>
      )}
    </div>
  )
}
