import { MapOverlayPage } from '#components/Templates/MapOverlayPage'

export const LoadingMapOverlay = () => {
  return (
    <MapOverlayPage
      backdrop
      showCloseButton={false}
      className='tw:max-w-xs tw:h-64 tw:bg-transparent'
      card={false}
    >
      <div className='tw:flex tw:justify-center tw:items-center tw:h-full'>
        <div className='tw:loading tw:loading-spinner tw:loading-xl'></div>
      </div>
    </MapOverlayPage>
  )
}
