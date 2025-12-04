import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'

import { useAuth } from '#components/Auth/useAuth'
import { useUpdateItem } from '#components/Map/hooks/useItems'
import { useMyProfile } from '#components/Map/hooks/useMyProfile'
import { MapOverlayPage } from '#components/Templates/MapOverlayPage'

import type { FullItemsApi } from '#types/FullItemsApi'
import type { InviteApi } from '#types/InviteApi'
import type { Item } from '#types/Item'

interface Props {
  inviteApi: InviteApi
  itemsApi: FullItemsApi<Item>
}

/**
 * @category Onboarding
 */
export function InvitePage({ inviteApi, itemsApi }: Props) {
  const { isAuthenticated, isInitialized: isAuthenticationInitialized } = useAuth()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const updateItem = useUpdateItem()

  const { myProfile, isUserProfileLayerLoaded, createEmptyProfile } = useMyProfile()

  if (!id) throw new Error('Invite ID is required')

  const [invitingProfile, setInvitingProfile] = useState<Item | null>(null)
  const [isRedeemingDone, setRedeemingDone] = useState(false)
  const [isValidationDone, setValidationDone] = useState(false)

  async function redeemInvite(id: string, myProfileId: string) {
    const invitingProfileId = await inviteApi.redeemInvite(id, myProfileId)

    if (invitingProfileId) {
      toast.success('Invite redeemed successfully!')
      localStorage.removeItem('inviteCode')
      setRedeemingDone(true)
      navigate(`/item/${invitingProfileId}`)
    } else {
      toast.error('Failed to redeem invite')
      navigate('/')
    }
  }

  const confirmFollowAsync = async () => {
    if (!isAuthenticated) return

    if (!isUserProfileLayerLoaded || isRedeemingDone) return

    const myActualProfile = myProfile ?? (await createEmptyProfile())

    if (!myActualProfile) {
      toast.error('Failed to create profile')
      return
    }

    if (!invitingProfile) {
      toast.error('Inviting profile not found')
      return
    }

    await redeemInvite(id, myActualProfile.id)

    // Add new relation to local state
    updateItem({
      ...myActualProfile,
      relations: [
        ...(myActualProfile.relations ?? []),
        {
          type: 'is_following',
          direction: 'outgoing',
          related_items_id: invitingProfile.id,
        },
      ],
    })

    setRedeemingDone(true)
  }

  const confirmFollow = () => {
    void confirmFollowAsync()
  }

  useEffect(() => {
    async function validateInvite(id: string) {
      const invitingProfileId = await inviteApi.validateInvite(id)

      if (!invitingProfileId) {
        toast.error('Invalid invite code')
        localStorage.removeItem('inviteCode')
        navigate('/')
        return
      }

      const invitingProfile = await itemsApi.getItem(invitingProfileId)

      if (invitingProfileId === myProfile?.id) {
        toast.error('You cannot invite yourself')
        localStorage.removeItem('inviteCode')
        // Navigate to own profile
        navigate('/item/' + myProfile.id)
        return
      }

      if (
        myProfile?.relations?.some(
          (r) => r.type === 'is_following' && r.related_items_id === invitingProfileId,
        )
      ) {
        toast.error('You are already following this profile')
        localStorage.removeItem('inviteCode')
        navigate('/item/' + invitingProfileId)
        return
      }

      if (!invitingProfile) {
        toast.error('Inviting profile not found')
        localStorage.removeItem('inviteCode')
        navigate('/')
        return
      }

      setInvitingProfile(invitingProfile)
    }

    if (!id) throw new Error('Invite ID is required')

    if (!isAuthenticationInitialized) return

    if (isValidationDone) return

    if (!isAuthenticated) {
      // Save invite code in local storage
      localStorage.setItem('inviteCode', id)
    }

    if (!isUserProfileLayerLoaded) return

    setValidationDone(true)
    void validateInvite(id)
  }, [
    id,
    isAuthenticated,
    inviteApi,
    navigate,
    isAuthenticationInitialized,
    myProfile,
    itemsApi,
    isRedeemingDone,
    isValidationDone,
    createEmptyProfile,
    isUserProfileLayerLoaded,
  ])

  const goToSignup = () => {
    navigate('/signup')
  }

  const goToLogin = () => {
    navigate('/login')
  }

  const goToStart = () => {
    navigate('/')
  }

  if (isAuthenticated) {
    return (
      <MapOverlayPage backdrop className='tw:max-w-xs tw:h-fit'>
        <h2 className='tw-text-2xl tw-font-semibold tw-mb-2 tw-text-center'>Confirmation</h2>
        {invitingProfile ? (
          <div className='tw-text-center tw-mb-4'>
            <p className='tw-text-sm tw-text-gray-600'>
              Do you want to follow <strong>{invitingProfile.name}</strong>?
            </p>
            <div className='tw-flex tw:justify-center tw:mt-4'>
              <button className='tw-btn tw-btn-primary' onClick={confirmFollow}>
                Yes
              </button>
              <button className='tw-btn tw-btn-secondary' onClick={goToStart}>
                No
              </button>
            </div>
          </div>
        ) : (
          <p className='tw-text-center'>Validating invite...</p>
        )}
      </MapOverlayPage>
    )
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
            <button className='tw-btn tw-btn-primary' onClick={goToSignup}>
              {'Sign Up'}
            </button>
            <button className='tw-btn tw-btn-secondary' onClick={goToLogin}>
              Login
            </button>
          </div>
        </div>
      ) : (
        <p className='tw-text-center'>Validating invite...</p>
      )}
    </MapOverlayPage>
  )
}
