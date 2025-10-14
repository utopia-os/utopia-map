import { toast } from 'react-toastify'

import type { Item } from '#types/Item'
import type { SharePlatformConfigs } from './types'

export const useNavigationUrl = (coordinates?: [number, number]) => {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  )

  const getNavigationUrl = () => {
    if (!coordinates) return ''

    const [longitude, latitude] = coordinates

    if (isIOS) {
      return `https://maps.apple.com/?daddr=${latitude},${longitude}`
    } else if (isMobile) {
      return `geo:${latitude},${longitude}`
    } else {
      return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
    }
  }

  return {
    getNavigationUrl,
    isMobile,
    isIOS,
  }
}

export const useShareLogic = (item?: Item) => {
  const shareUrl = window.location.href
  const shareTitle = item?.name ?? 'Utopia Map Item'
  const inviteLink = item?.secrets
    ? `${window.location.origin}/invite/${item.secrets[0].secret}`
    : shareUrl

  const copyLink = () => {
    navigator.clipboard
      .writeText(inviteLink)
      .then(() => {
        toast.success('Link copied to clipboard')
        return null
      })
      .catch(() => {
        toast.error('Error copying link')
      })
  }

  const getShareUrl = (
    platform: keyof SharePlatformConfigs,
    platformConfigs: SharePlatformConfigs,
  ) => {
    // eslint-disable-next-line security/detect-object-injection
    const config = platformConfigs[platform]
    return config.shareUrl
      .replace('{url}', encodeURIComponent(shareUrl))
      .replace('{title}', encodeURIComponent(shareTitle))
  }

  return {
    shareUrl,
    shareTitle,
    inviteLink,
    copyLink,
    getShareUrl,
  }
}

export const useFormatDistance = () => {
  const formatDistance = (dist: number | null): string | null => {
    if (!dist) return null
    return dist < 10 ? `${dist.toFixed(1)} km` : `${Math.round(dist)} km`
  }

  return { formatDistance }
}
