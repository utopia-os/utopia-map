import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'

import { useAuth } from '#components/Auth/useAuth'
import { useAllItemsLoaded, useItems } from '#components/Map/hooks/useItems'
import { useMyProfile } from '#components/Map/hooks/useMyProfile'
import { MapOverlayPage } from '#components/Templates/MapOverlayPage'

import type { InviteApi } from '#types/InviteApi'
import type { Item } from '#types/Item'

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
  const items = useItems()
  const allItemsLoaded = useAllItemsLoaded() && items.length > 0

  if (!id) throw new Error('Invite ID is required')

  const [invitingProfile, setInvitingProfile] = useState<Item | null>(null)

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
        navigate(`/item/${invitingProfileId}`)
      } else {
        toast.error('Failed to redeem invite')
        navigate('/')
      }
    }

    async function validateInvite() {
      if (!id) throw new Error('Invite ID is required')

      const invitingProfileId = await inviteApi.validateInvite(id)

      if (!invitingProfileId) {
        toast.error('Invalid invite code')
        navigate('/')
        return
      }

      const invitingProfile = items.find((item) => item.id === invitingProfileId)

      if (!invitingProfile) {
        toast.error('Inviting profile not found')
        navigate('/')
        return
      }

      setInvitingProfile(invitingProfile)
    }

    if (!isAuthenticationInitialized || !allItemsLoaded) return

    if (isAuthenticated) {
      void redeemInvite()
    } else {
      // Save invite code in local storage
      localStorage.setItem('inviteCode', id)

      void validateInvite()
    }
  }, [
    id,
    isAuthenticated,
    inviteApi,
    navigate,
    isAuthenticationInitialized,
    myProfile,
    isMyProfileLoaded,
    items,
    allItemsLoaded,
  ])

  const goToSignup = () => {
    navigate('/signup')
  }

  const goToLogin = () => {
    navigate('/login')
  }

  return (
    <MapOverlayPage backdrop className='tw:max-w-xs tw:h-fit'>
      <h2 className='tw:text-2xl tw:font-semibold tw:mb-2 tw:text-center'>Invitation</h2>
      {invitingProfile ? (
        <div className='tw-text-center tw-mb-4'>
          <p className='tw-text-lg tw-font-semibold'>Welcome to Utopia!</p>
          <p className='tw-text-sm tw-text-gray-600'>
            You have been invited by: <strong>{invitingProfile.name}</strong> to join the Utopia
            community.
          </p>
          <div className='tw-flex tw:justify-center tw:mt-4'>
            <button
              className='tw-btn tw-btn-primary'
              onClick={isAuthenticated ? () => navigate('/') : goToSignup}
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Sign Up'}
            </button>
            {!isAuthenticated && (
              <button className='tw-btn tw-btn-secondary' onClick={goToLogin}>
                Login
              </button>
            )}
          </div>
        </div>
      ) : (
        <p className='tw-text-center'>Validating invite...</p>
      )}
    </MapOverlayPage>
  )
}
