import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'

import { useAppState } from '#components/AppShell/hooks/useAppState'
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
  const { appName } = useAppState()

  const { myProfile, isUserProfileLayerLoaded } = useMyProfile()

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
      void navigate(`/item/${invitingProfileId}`)
    } else {
      toast.error('Failed to redeem invite')
      void navigate('/')
    }
  }

  const confirmFollowAsync = async () => {
    if (!isAuthenticated || !isUserProfileLayerLoaded || isRedeemingDone) return

    if (!myProfile) {
      toast.error('Profile not found. Please wait for your profile to be created.')
      return
    }

    if (!invitingProfile) {
      toast.error('Inviting profile not found')
      return
    }

    await redeemInvite(id, myProfile.id)

    // Add new relation to local state
    updateItem({
      ...myProfile,
      relations: [
        ...(myProfile.relations ?? []),
        {
          type: 'is_following',
          direction: 'outgoing',
          // eslint-disable-next-line camelcase
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
        void navigate('/')
        return
      }

      const invitingProfile = await itemsApi.getItem(invitingProfileId)

      if (!invitingProfile) {
        toast.error('Inviting profile not found')
        localStorage.removeItem('inviteCode')
        void navigate('/')
        return
      }

      if (invitingProfileId === myProfile?.id) {
        toast.error('You cannot invite yourself')
        localStorage.removeItem('inviteCode')
        // Navigate to own profile
        void navigate('/item/' + myProfile.id)
        return
      }

      if (
        myProfile?.relations?.some(
          (r) => r.type === 'is_following' && r.related_items_id === invitingProfileId,
        )
      ) {
        toast.error('You are already following this profile')
        localStorage.removeItem('inviteCode')
        void navigate('/item/' + invitingProfileId)
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
    isUserProfileLayerLoaded,
  ])

  const goToSignup = () => {
    void navigate('/signup')
  }

  const goToLogin = () => {
    void navigate('/login')
  }

  const goToStart = () => {
    void navigate('/')
  }

  if (isAuthenticated) {
    return (
      <MapOverlayPage backdrop className='tw:max-w-xs tw:h-fit'>
        <h2 className='tw:text-2xl tw:font-semibold tw:mb-2 tw:text-center'>Confirmation</h2>
        {invitingProfile ? (
          <>
            <p className='tw:text-sm tw:text-base-content/70 tw:text-center'>
              Do you want to follow <strong>{invitingProfile.name}</strong>?
            </p>
            <div className='tw:card-actions tw:justify-between'>
              <button className='tw:btn tw:btn-ghost' onClick={goToStart}>
                No
              </button>
              <button className='tw:btn tw:btn-primary' onClick={confirmFollow}>
                Yes
              </button>
            </div>
          </>
        ) : (
          <div className='tw:flex tw:justify-center'>
            <span className='tw:loading tw:loading-spinner tw:loading-md'></span>
          </div>
        )}
      </MapOverlayPage>
    )
  }

  return (
    <MapOverlayPage backdrop className='tw:max-w-xs tw:h-fit'>
      {invitingProfile ? (
        <>
          <h2 className='tw:text-2xl tw:font-semibold tw:mb-2 tw:text-center'>
            Welcome{appName && <> to {appName}</>}!
          </h2>
          <p className='tw:text-sm tw:text-base-content/70 tw:text-center'>
            You have been invited by <strong>{invitingProfile.name}</strong> to join{' '}
            {appName || 'the community'}.
          </p>
          <div className='tw:card-actions tw:justify-between'>
            <button className='tw:btn tw:btn-ghost' onClick={goToLogin}>
              Login
            </button>
            <button className='tw:btn tw:btn-primary' onClick={goToSignup}>
              Sign Up
            </button>
          </div>
        </>
      ) : (
        <div className='tw:flex tw:justify-center'>
          <span className='tw:loading tw:loading-spinner tw:loading-md'></span>
        </div>
      )}
    </MapOverlayPage>
  )
}
