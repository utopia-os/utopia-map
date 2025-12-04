import { useEffect, useRef, useState } from 'react'

import { ItemSubtitle } from './ItemSubtitle'

import type { Item } from '#types/Item'

interface ItemTitleProps {
  item: Item
  big?: boolean
  truncateSubname?: boolean
  subtitleMode?: 'address' | 'custom' | 'none'
  hasAvatar?: boolean
}

export function ItemTitle({
  item,
  big = false,
  truncateSubname = true,
  subtitleMode = 'address',
  hasAvatar = false,
}: ItemTitleProps) {
  const titleRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [fontSize, setFontSize] = useState<string>('tw:text-xl')

  const title = item.name ?? item.layer?.item_default_name

  useEffect(() => {
    if (!containerRef.current || !title) {
      return
    }

    const calculateFontSize = () => {
      const container = containerRef.current
      if (!container) return

      const containerWidth = container.offsetWidth

      // Create temporary element to measure text width
      const measureElement = document.createElement('span')
      measureElement.style.position = 'absolute'
      measureElement.style.visibility = 'hidden'
      measureElement.style.whiteSpace = 'nowrap'
      measureElement.style.fontWeight = '700' // font-bold
      measureElement.textContent = title
      document.body.appendChild(measureElement)

      // Measure at different font sizes - include larger sizes only if big is true
      const fontSizes = big
        ? [
            { class: 'tw:text-2xl', pixels: 24 },
            { class: 'tw:text-xl', pixels: 20 },
            { class: 'tw:text-lg', pixels: 18 },
          ]
        : [
            { class: 'tw:text-xl', pixels: 20 },
            { class: 'tw:text-lg', pixels: 18 },
          ]

      let selectedSize = 'tw:text-lg'

      for (const size of fontSizes) {
        measureElement.style.fontSize = `${size.pixels}px`
        const textWidth = measureElement.offsetWidth

        if (textWidth <= containerWidth) {
          selectedSize = size.class
          break
        }
      }

      document.body.removeChild(measureElement)
      setFontSize(selectedSize)
    }

    // Initial calculation
    calculateFontSize()

    // Watch for container size changes
    const resizeObserver = new ResizeObserver(calculateFontSize)
    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [title, big])

  return (
    <div
      ref={containerRef}
      className={`${hasAvatar ? 'tw:ml-3' : ''} tw:overflow-hidden tw:flex-1 tw:min-w-0 `}
    >
      <div
        ref={titleRef}
        className={`${fontSize} tw:font-bold ${!big ? 'tw:truncate' : ''}`}
        title={title}
        data-cy='profile-title'
      >
        {title}
      </div>
      <ItemSubtitle item={item} mode={subtitleMode} truncate={truncateSubname} />
    </div>
  )
}
