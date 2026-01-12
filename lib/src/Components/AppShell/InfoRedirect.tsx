import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

interface InfoRedirectProps {
  /** If true, redirects to /info route on initial page load (once) */
  enabled?: boolean
}

/**
 * Redirects to /info route on initial page load when enabled.
 * Only redirects once per session to avoid redirect loops.
 * Place this component inside the Router context but outside of Routes.
 * @category AppShell
 */
export function InfoRedirect({ enabled }: InfoRedirectProps) {
  const navigate = useNavigate()
  const hasRedirected = useRef(false)

  useEffect(() => {
    if (enabled && window.location.pathname === '/' && !hasRedirected.current) {
      hasRedirected.current = true
      void navigate('/info')
    }
  }, [enabled, navigate])

  return null
}
