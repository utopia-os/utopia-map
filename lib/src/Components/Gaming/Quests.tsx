import QuestionMarkCircleIcon from '@heroicons/react/24/outline/QuestionMarkCircleIcon'
import { useEffect, useState } from 'react'

import { useAuth } from '#components/Auth/useAuth'
import { useItems } from '#components/Map/hooks/useItems'

import { useQuestsOpen, useSetQuestOpen } from './hooks/useQuests'

import type { Item } from '#types/Item'

/**
 * @category Gaming
 */
export function Quests() {
  const questsOpen = useQuestsOpen()
  const setQuestsOpen = useSetQuestOpen()
  const { isAuthenticated, user } = useAuth()

  useEffect(() => {
    setQuestsOpen(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [profile, setProfie] = useState<Item>()

  const items = useItems()

  useEffect(() => {
    setProfie(
      items.find(
        (i) =>
          i.user_created?.id === user?.id &&
          i.layer?.userProfileLayer &&
          i.user_created?.id != null,
      ),
    )
  }, [items, user])

  return (
    <>
      {questsOpen ? (
        <div className='tw:card tw:w-48 tw:bg-base-100 tw:shadow-xl tw:absolute tw:bottom-4 tw:left-4 tw:z-2000'>
          <div className='tw:card-body tw:p-4 tw:pt-0'>
            <div className='tw:card-actions tw:justify-end'>
              <label
                className='tw:btn tw:btn-sm tw:btn-circle tw:btn-ghost tw:absolute tw:right-1 tw:top-1'
                onClick={() => {
                  setQuestsOpen(false)
                }}
              >
                ✕
              </label>
            </div>
            <h2 className='tw:card-title tw:m-auto '>
              Level 1
              <QuestionMarkCircleIcon />
            </h2>
            <ul className='tw:flex-row'>
              <li>
                <label className='tw:label tw:justify-normal tw:pt-1 tw:pb-0'>
                  <input
                    type='checkbox'
                    readOnly={true}
                    className='tw:checkbox tw:checkbox-xs tw:checkbox-success'
                    checked={isAuthenticated || false}
                  />
                  <span className='tw:text-sm tw:label-text tw:mx-2'>Sign Up</span>
                </label>
              </li>
              <li>
                <label className='tw:label tw:justify-normal tw:pt-1 tw:pb-0'>
                  <input
                    type='checkbox'
                    readOnly={true}
                    className='tw:checkbox tw:checkbox-xs tw:checkbox-success'
                    checked={!!profile?.text}
                  />
                  <span className='tw:text-sm tw:label-text tw:mx-2'>Fill Profile</span>
                </label>
              </li>
              <li>
                <label className='tw:label tw:justify-normal tw:pt-1 tw:pb-0'>
                  <input
                    type='checkbox'
                    readOnly={true}
                    className='tw:checkbox tw:checkbox-xs tw:checkbox-success'
                    checked={!!profile?.image}
                  />
                  <span className='tw:text-sm tw:label-text tw:mx-2'>Upload Avatar</span>
                </label>
              </li>
            </ul>
            {/**                 <button className='tw:btn tw:btn-xs tw:btn-neutral tw:w-fit tw:self-center tw:mt-1'>Next &gt;</button> */}{' '}
          </div>
        </div>
      ) : (
        ''
      )}
    </>
  )
}
