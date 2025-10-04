import ArrowsPointingInIcon from '@heroicons/react/24/outline/ArrowsPointingInIcon'
import ArrowsPointingOutIcon from '@heroicons/react/24/outline/ArrowsPointingOutIcon'
import { useEffect, useState } from 'react'

export const FullscreenControl = () => {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement != null)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      void document.documentElement.requestFullscreen()
    } else {
      void document.exitFullscreen()
    }
  }

  return (
    <div className='tw:card tw:bg-base-100 tw:shadow-xl tw:mt-2 tw:w-fit'>
      <div
        className='tw:card-body tw:hover:bg-slate-300 tw:card tw:p-2 tw:h-10 tw:w-10 tw:transition-all tw:duration-300 tw:hover:cursor-pointer'
        onClick={toggleFullscreen}
      >
        {isFullscreen ? (
          <ArrowsPointingInIcon className='tw:stroke-[2.5]' />
        ) : (
          <ArrowsPointingOutIcon className='tw:stroke-[2.5]' />
        )}
      </div>
    </div>
  )
}
