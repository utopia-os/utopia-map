import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '#components/Auth/useAuth'

export const useStoredInviteCode = () => {
  const inviteCode = localStorage.getItem('inviteCode')

  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!inviteCode || !user) return

    navigate(`/invite/${inviteCode}`)
  }, [inviteCode, navigate, user])
}
