/* eslint-disable camelcase */ // Directus database fields use snake_case
import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import { useAppState } from '#components/AppShell/hooks/useAppState'
import { useItems } from '#components/Map/hooks/useItems'

import { EmojiPicker } from './EmojiPicker'
import { MapOverlayPage } from './MapOverlayPage'

import type { Item } from '#types/Item'
import type { ItemsApi } from '#types/ItemsApi'

/**
 * @category Templates
 */
export const AttestationForm = ({ api }: { api?: ItemsApi<unknown> }) => {
  const items = useItems()
  const appState = useAppState()
  const [users, setUsers] = useState<Item[]>()
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const toUserIds = params.get('to')
    setUsers(items.filter((i) => toUserIds?.includes(i.id)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, location])

  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.width = 'auto'
      inputRef.current.style.width = `${inputRef.current.scrollWidth + 20}px`
    }
  }, [inputValue])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value)
  }

  const sendAttestation = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const to: any[] = []
    users?.map((u) => to.push({ directus_users_id: u.user_created?.id }))

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    api?.createItem &&
      toast
        .promise(
          api.createItem({
            text: inputValue,
            emoji: selectedEmoji,
            color: selectedColor,
            shape: selectedShape,
            to,
          }),
          {
            pending: 'creating attestation ...',
            success: 'Attestation created',
            error: {
              render({ data }) {
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                return `${data}`
              },
            },
          },
        )
        .then(() => {
          navigate(
            '/item/' +
              // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
              items.find(
                (i) =>
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                  i.user_created?.id === to[0].directus_users_id &&
                  i.layer?.userProfileLayer === true,
              )?.id +
              '?tab=2',
          )
        })
  }

  const [selectedEmoji, setSelectedEmoji] = useState('select badge')
  const [selectedShape, setSelectedShape] = useState('circle')
  const [selectedColor, setSelectedColor] = useState('#fff0d6')

  return (
    <MapOverlayPage backdrop className='tw:h-fit tw:min-h-56 tw:w-96'>
      <div className='tw:text-center tw:text-xl tw:font-bold'>Gratitude</div>
      <div className='tw:text-center tw:text-base tw:text-gray-400'>to</div>
      <div className='tw:flex tw:flex-row tw:justify-center tw:items-center tw:flex-wrap'>
        {users?.map(
          (u, k) => (
            <div key={k} className='tw:flex tw:items-center tw:space-x-3 tw:mx-2 tw:my-1'>
              {u.image ? (
                <div className='tw:avatar'>
                  <div className='tw:mask tw:mask-circle tw:w-8 tw:h-8'>
                    <img
                      src={appState.assetsApi.url + u.image + '?width=40&heigth=40'}
                      alt='Avatar'
                    />
                  </div>
                </div>
              ) : (
                <div className='tw:mask tw:mask-circle tw:text-xl tw:md:text-2xl tw:bg-slate-200 tw:rounded-full tw:w-8 tw:h-8'></div>
              )}
              <div>
                <div className='tw:font-bold'>{u.name}</div>
              </div>
            </div>
          ),
          ', ',
        )}
      </div>

      <div className='tw:w-full'>
        <div className='tw:flex tw:justify-center tw:items-center'>
          <div className=' tw:flex tw:justify-center tw:items-center tw:w-28 tw:h-28 tw:m-4'>
            <EmojiPicker
              selectedEmoji={selectedEmoji}
              selectedColor={selectedColor}
              selectedShape={selectedShape}
              setSelectedEmoji={setSelectedEmoji}
              setSelectedColor={setSelectedColor}
              setSelectedShape={setSelectedShape}
            />
          </div>
        </div>
        <div className='tw:flex tw:justify-center tw:items-center'>
          <input
            ref={inputRef}
            value={inputValue}
            onChange={handleChange}
            type='text'
            placeholder='... and say some words'
            className='input tw:min-w-0 tw:w-fit tw:resize-none tw:overflow-hidden tw:text-center '
          />
        </div>
      </div>
      <div className='tw:w-full tw:grid tw:mt-4'>
        <button onClick={sendAttestation} className='tw:btn tw:place-self-center tw:px-8'>
          Next
        </button>
      </div>
    </MapOverlayPage>
  )
}
