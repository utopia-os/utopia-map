import { useEffect, useRef } from 'react'

import type { MouseEvent } from 'react'

const isClickInsideRectangle = (e: MouseEvent, element: HTMLElement) => {
  const r = element.getBoundingClientRect()

  return e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom
}

interface Props {
  title?: string
  isOpened: boolean
  onClose: () => void
  children: React.ReactNode
  showCloseButton?: boolean
  closeOnClickOutside?: boolean
  className?: string
}

const DialogModal = ({
  title,
  isOpened,
  onClose,
  children,
  showCloseButton = true,
  closeOnClickOutside = true,
  className,
}: Props) => {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (isOpened) {
      ref.current?.showModal()
      ref.current?.classList.remove('tw:hidden')
      document.body.style.overflow = 'hidden'
    } else {
      ref.current?.close()
      ref.current?.classList.add('tw:hidden')
      document.body.style.overflow = ''
    }
  }, [isOpened])

  if (isOpened) {
    return (
      <dialog
        className={`${className ?? ''} tw:card tw:shadow-xl tw:absolute tw:right-0 tw:top-0 tw:bottom-0 tw:left-0 tw:m-auto tw:transition-opacity tw:duration-300 tw:p-4 tw:max-w-xl tw:bg-base-100`}
        ref={ref}
        onCancel={onClose}
        onClick={(e) => {
          if (ref.current && !isClickInsideRectangle(e, ref.current) && closeOnClickOutside) {
            onClose()
          }
        }}
      >
        <div className='tw:card-body tw:p-2'>
          {title && (
            <h2 className='tw:text-2xl tw:font-semibold tw:mb-2 tw:text-center'>{title}</h2>
          )}

          {children}
          {showCloseButton && (
            <button
              className='tw:btn tw:btn-sm tw:btn-circle tw:btn-ghost tw:absolute tw:right-2 tw:top-2'
              onClick={onClose}
            >
              ✕
            </button>
          )}
        </div>
      </dialog>
    )
  } else return <></>
}

export default DialogModal
