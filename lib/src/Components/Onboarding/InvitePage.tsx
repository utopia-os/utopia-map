import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'

import { useAuth } from '#components/Auth/useAuth'
import { useMyProfile } from '#components/Map/hooks/useMyProfile'
import { MapOverlayPage } from '#components/Templates/MapOverlayPage'

import type { InviteApi } from '#types/InviteApi'

interface Props {
  inviteApi: InviteApi
}

/**
 * @category Onboarding
 */
export function InvitePage({ inviteApi }: Props) {
  const { isAuthenticated, isInitialized: isAuthenticationInitialized } = useAuth()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { myProfile, isMyProfileLoaded } = useMyProfile()

  if (!id) throw new Error('Invite ID is required')

  useEffect(() => {
    async function redeemInvite() {
      if (!id) throw new Error('Invite ID is required')

      if (!isMyProfileLoaded) return

      if (!myProfile) {
        toast.error('Could not find your profile to redeem the invite.')
        return
      }

      const invitingProfileId = await inviteApi.redeemInvite(id, myProfile.id)

      if (invitingProfileId) {
        toast.success('Invite redeemed successfully!')
        void navigate(`/item/${invitingProfileId}`)
      } else {
        toast.error('Failed to redeem invite')
        void navigate('/')
      }
    }

    if (!isAuthenticationInitialized) return

    if (isAuthenticated) {
      void redeemInvite()
    } else {
      // Save invite code in local storage
      localStorage.setItem('inviteCode', id)

      // Redirect to login page
      void navigate('/login')
    }
  }, [
    id,
    isAuthenticated,
    inviteApi,
    navigate,
    isAuthenticationInitialized,
    myProfile,
    isMyProfileLoaded,
  ])

  return (
    <MapOverlayPage backdrop className='tw:max-w-xs tw:h-fit'>
      <h2 className='tw:text-2xl tw:font-semibold tw:mb-2 tw:text-center'>Invitation</h2>
    </MapOverlayPage>
  )
}
