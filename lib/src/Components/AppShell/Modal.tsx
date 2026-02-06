import { MapOverlayPage } from '#components/Templates'

/**
 * @category AppShell
 */
export function Modal({ children }: { children: React.ReactNode }) {
  return (
    <MapOverlayPage
      backdrop
      card
      className='tw:h-fit tw:max-h-[calc(100%-2.5em)] tw:overflow-auto tw:w-[calc(100%-32px)] tw:min-w-80 tw:max-w-[612px] tw:transition-opacity tw:duration-500 tw:opacity-100 tw:pointer-events-auto'
    >
      {children}
    </MapOverlayPage>
  )
}
