import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import { useMyProfile } from './useMyProfile'

import type { InviteApi } from '#types/InviteApi'
import type { Item } from '#types/Item'

export const useRedeemInvite = (inviteApi: InviteApi) => {
  const inviteCode = localStorage.getItem('inviteCode')

  const { myProfile } = useMyProfile()
  const navigate = useNavigate()

  const [isRedeemingDone, setRedeemingDone] = useState(false)

  useEffect(() => {
    async function redeemInvite(inviteCode: string, myProfile: Item) {
      const invitingProfileId = await inviteApi.redeemInvite(inviteCode, myProfile.id)

      if (invitingProfileId) {
        toast.success('Invite redeemed successfully!')
        localStorage.removeItem('inviteCode')
        navigate(`/item/${invitingProfileId}`)
      } else {
        toast.error('Failed to redeem invite')
      }
    }

    if (!inviteCode || !myProfile || isRedeemingDone) return
    void redeemInvite(inviteCode, myProfile)
    setRedeemingDone(true)
  }, [inviteApi, inviteCode, isRedeemingDone, myProfile, navigate])
}
