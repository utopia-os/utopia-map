import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import { useMyProfile } from './useMyProfile'

import type { InviteApi } from '#types/InviteApi'

export const useRedeemInvite = (inviteApi: InviteApi) => {
  const inviteCode = localStorage.getItem('inviteCode')

  const { myProfile } = useMyProfile()
  const navigate = useNavigate()

  useEffect(() => {
    async function redeemInvite() {
      if (!inviteCode || !myProfile) return

      const invitingProfileId = await inviteApi.redeemInvite(inviteCode, myProfile.id)

      if (invitingProfileId) {
        toast.success('Invite redeemed successfully!')
        localStorage.removeItem('inviteCode')
        navigate(`/item/${invitingProfileId}`)
      } else {
        toast.error('Failed to redeem invite')
      }
    }

    void redeemInvite()
  }, [inviteApi, inviteCode, myProfile, navigate])
}
