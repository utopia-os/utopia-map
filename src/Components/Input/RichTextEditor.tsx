import { useEffect, useRef, useState } from 'react'

interface TextAreaProps {
  labelTitle?: string
  labelStyle?: string
  containerStyle?: string
  dataField?: string
  inputStyle?: string
  defaultValue: string
  placeholder?: string
  required?: boolean
  size?: string
  updateFormValue?: (value: string) => void
}

/**
 * @category Input
 */
export function RichTextEditor({
  labelTitle,
  dataField,
  labelStyle,
  containerStyle,
  inputStyle,
  defaultValue,
  placeholder,
  required = true,
  updateFormValue,
}: TextAreaProps) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const [inputValue, setInputValue] = useState<string>(defaultValue)

  useEffect(() => {
    setInputValue(defaultValue)
  }, [defaultValue])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    if (updateFormValue) {
      updateFormValue(newValue)
    }
  }

  return (
    <div className={`tw:form-control tw:w-full ${containerStyle ?? ''}`}>
      {labelTitle ? (
        <label className='tw:label'>
          <span className={`tw:label-text tw:text-base-content ${labelStyle ?? ''}`}>
            {labelTitle}
          </span>
        </label>
      ) : null}
      <textarea
        required={required}
        ref={ref}
        value={inputValue}
        name={dataField}
        className={`tw:textarea tw:textarea-bordered tw:w-full tw:leading-5 ${inputStyle ?? ''}`}
        placeholder={placeholder ?? ''}
        onChange={handleChange}
      ></textarea>
    </div>
  )
}
