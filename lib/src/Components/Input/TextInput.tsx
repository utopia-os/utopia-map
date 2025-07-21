import { useEffect, useState } from 'react'

import { InputLabel } from './InputLabel'

interface InputTextProps {
  labelTitle?: string
  type?: string
  dataField?: string
  containerStyle?: string
  inputStyle?: string
  defaultValue?: string
  placeholder?: string
  autocomplete?: string
  pattern?: string
  required?: boolean
  updateFormValue?: (value: string) => void
}

/**
 * @category Input
 */
export function TextInput({
  labelTitle,
  type,
  dataField,
  containerStyle,
  inputStyle,
  defaultValue,
  placeholder,
  autocomplete,
  pattern,
  required = true,
  updateFormValue,
}: InputTextProps) {
  const [inputValue, setInputValue] = useState<string>(defaultValue ?? '')

  useEffect(() => {
    setInputValue(defaultValue ?? '')
  }, [defaultValue])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    if (updateFormValue) {
      updateFormValue(newValue)
    }
  }

  return (
    <div className={`tw:form-control ${containerStyle ?? ''}`}>
      {labelTitle ? <InputLabel label={labelTitle} /> : null}
      <input
        required={required}
        pattern={pattern}
        type={type ?? 'text'}
        name={dataField}
        value={inputValue}
        placeholder={placeholder ?? ''}
        autoComplete={autocomplete}
        onChange={handleChange}
        className={`tw:input tw:input-bordered tw:w-full ${inputStyle ?? ''}`}
      />
    </div>
  )
}
