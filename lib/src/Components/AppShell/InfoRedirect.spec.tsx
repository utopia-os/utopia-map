import { render, cleanup } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

import { InfoRedirect } from './InfoRedirect'

// --- Mocks ---

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Save original location so we can restore it after each test
const originalLocation = window.location

// Helper to set window.location.pathname for tests
function setPathname(pathname: string) {
  Object.defineProperty(window, 'location', {
    value: { pathname, search: '', hash: '', href: `http://localhost${pathname}` },
    writable: true,
    configurable: true,
  })
}

// --- Tests ---

describe('<InfoRedirect />', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setPathname('/')
  })

  afterEach(() => {
    cleanup()
    // Restore original window.location to avoid leaking into other test files
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
    })
  })

  it('U1: navigates to /info when enabled and pathname is "/"', () => {
    render(<InfoRedirect enabled={true} />)

    expect(mockNavigate).toHaveBeenCalledTimes(1)
    expect(mockNavigate).toHaveBeenCalledWith('/info')
  })

  it('U2: does NOT navigate when enabled is false', () => {
    render(<InfoRedirect enabled={false} />)

    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('U3: does NOT navigate when pathname is not "/"', () => {
    setPathname('/login')

    render(<InfoRedirect enabled={true} />)

    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('U4: only navigates once even if re-rendered', () => {
    const { rerender } = render(<InfoRedirect enabled={true} />)

    expect(mockNavigate).toHaveBeenCalledTimes(1)

    rerender(<InfoRedirect enabled={true} />)

    expect(mockNavigate).toHaveBeenCalledTimes(1)
  })
})
