import { useEffect } from 'react'

import { MapOverlayPage } from '#components/Templates'

/**
 * @category Gaming
 */
export function Modal({
  children,
  showOnStartup,
}: {
  children: React.ReactNode
  showOnStartup?: boolean
}) {
  useEffect(() => {
    if (showOnStartup) {
      window.my_modal_3.showModal()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <MapOverlayPage
        backdrop
        card
        className={`tw:absolute tw:h-fit tw:max-h-[calc(100%-2.5em)] tw:top-4 tw:bottom-4 tw:left-1/2 tw:transform tw:-translate-x-1/2 tw:overflow-scroll tw:md:w-[calc(50%-32px)] tw:w-[calc(100%-32px)] tw:min-w-80 tw:max-w-[612px] tw:transition-opacity tw:duration-500 tw:opacity-100 tw:pointer-events-auto`}
      >
        {children}
      </MapOverlayPage>
    </>
  )
}
