/* eslint-disable @typescript-eslint/consistent-type-definitions */
type ContentProps = {
  children?: React.ReactNode
}

/**
 * @category AppShell
 */
export function Content({ children }: ContentProps) {
  return (
    <div className='tw-flex tw-flex-col tw-w-full tw-h-full tw-bg-base-200 tw-relative'>
      {children}
    </div>
  )
}
