export const InputLabel = ({ label }: { label: string }) => {
  return (
    <label className='tw:label tw:pb-1'>
      <span className='tw:block tw:text-sm tw:font-medium tw:text-base-content/50 tw:mb-1'>
        {label}:
      </span>
    </label>
  )
}
