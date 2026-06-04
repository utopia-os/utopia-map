import { Component } from 'react'

import type { ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  componentName?: string
}

interface State {
  hasError: boolean
  error?: Error
}

/**
 * Error boundary for profile components.
 * Catches errors in child components and displays a fallback UI instead of crashing the entire profile.
 */
export class ComponentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error(
      `Error in component ${this.props.componentName ?? 'unknown'}:`,
      error,
      errorInfo.componentStack,
    )
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      return (
        <div className='tw:p-4 tw:text-error tw:bg-error/10 tw:rounded-lg tw:my-2'>
          <p className='tw:font-semibold'>Failed to load component</p>
          {this.props.componentName && (
            <p className='tw:text-sm tw:opacity-70'>{this.props.componentName}</p>
          )}
        </div>
      )
    }

    return this.props.children
  }
}
