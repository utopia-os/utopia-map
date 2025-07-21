/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { useEffect, useState } from 'react'

import { InputLabel, RichTextEditor } from '#components/Input'

import { MarkdownHint } from './MarkdownHint'

import type { FormState } from '#types/FormState'

export const ProfileTextForm = ({
  state,
  setState,
  dataField,
  heading,
  size,
}: {
  state: FormState
  setState: React.Dispatch<React.SetStateAction<FormState>>
  dataField?: string
  heading: string
  size: string
  hideInputLabel: boolean
}) => {
  const [field, setField] = useState<string>(dataField || 'text')

  useEffect(() => {
    if (!dataField) {
      setField('text')
    }
  }, [dataField])

  return (
    <div
      className={`tw:max-h-124 tw:md:max-h-full tw:flex tw:flex-col tw:mt-3 ${size === 'full' ? 'tw:flex-1 tw:min-h-42' : 'tw:h-30 tw:flex-none'}`}
    >
      <div className='tw:flex tw:justify-between tw:items-center'>
        <InputLabel label={heading || 'Text'} />
        <MarkdownHint />
      </div>
      <RichTextEditor
        placeholder={'...'}
        // eslint-disable-next-line security/detect-object-injection
        defaultValue={state[field]}
        updateFormValue={(v) =>
          setState((prevState) => ({
            ...prevState,
            [field]: v,
          }))
        }
        showMenu={size === 'full'}
        containerStyle={size === 'full' ? 'tw:flex-1' : 'tw:h-24 tw:flex-none'}
      />
    </div>
  )
}
