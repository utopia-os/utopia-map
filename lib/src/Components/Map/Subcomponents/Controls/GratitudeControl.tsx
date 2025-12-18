import HeartIcon from '@heroicons/react/24/outline/HeartIcon'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '#components/Auth/useAuth'

export const GratitudeControl = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return (
      <div className='tw:card tw:bg-base-100 tw:shadow-xl tw:mt-2 tw:w-fit'>
        {
          <div
            className='tw:card-body tw:hover:bg-slate-300 tw:card tw:p-2 tw:h-10 tw:w-10 tw:transition-all tw:duration-300 tw:hover:cursor-pointer'
            onClick={() => {
              void navigate('/select-user')
            }}
          >
            <HeartIcon className='tw:stroke-[2.5]' />
          </div>
        }
      </div>
    )
  } else return <></>
}
