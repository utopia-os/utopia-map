import { Link } from 'react-router-dom'

import { useAppState } from '#components/AppShell/hooks/useAppState'
import { useItems } from '#components/Map/hooks/useItems'
import { useAttestations } from '#components/Profile/hooks/useAttestations'
import { timeAgo } from '#utils/TimeAgo'

import type { Item } from '#types/Item'

interface Props {
  item: Item
  heading?: string
  hideWhenEmpty?: boolean
}

export const AttestationsView = ({ item, heading = 'Trust', hideWhenEmpty = true }: Props) => {
  const attestations = useAttestations()
  const items = useItems()
  const appState = useAppState()

  const getUserProfile = (userId: string) => {
    return items.find((i) => i.user_created?.id === userId && i.layer?.userProfileLayer)
  }

  // Filter attestations for this user
  const userAttestations = attestations
    .filter((a) => a.to.some((t) => t.directus_users_id === item.user_created?.id))
    .sort((a, b) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime())

  if (hideWhenEmpty && userAttestations.length === 0) {
    return null
  }

  return (
    <div>
      <h2 className='tw:text-lg tw:font-bold tw:mb-2'>{heading}</h2>
      <table className='sm:tw:table-sm md:tw:table-md tw:w-full'>
        <tbody>
          {userAttestations.map((a) => (
            <tr key={a.id}>
              <td>
                <div
                  className={`tw:cursor-pointer tw:text-3xl tw:mask ${a.shape === 'squircle' ? 'tw:mask-squircle' : a.shape === 'circle' ? 'tw:mask-circle' : 'tw:mask-hexagon-2'} tw:p-2 tw:my-2 tw:mr-2 tw:shadow-xl`}
                  style={{ backgroundColor: a.color }}
                >
                  {a.emoji}
                </div>
              </td>
              <td>
                <div className='tw:mr-2'>
                  <i>{a.text}</i>
                </div>
              </td>
              <td>
                {getUserProfile(a.user_created.id) ? (
                  <Link to={'/item/' + (getUserProfile(a.user_created.id)?.id ?? '')}>
                    <div className='flex items-center gap-3'>
                      <div className='tw:avatar'>
                        <div className='tw:mask tw:rounded-full tw:h-8 tw:w-8 tw:mr-2'>
                          {getUserProfile(a.user_created.id)?.image && (
                            <img
                              src={
                                appState.assetsApi.url +
                                (getUserProfile(a.user_created.id)?.image ?? '')
                              }
                              alt='Avatar'
                            />
                          )}
                        </div>
                      </div>
                      <div>
                        <div className='font-bold'>
                          {getUserProfile(a.user_created.id)?.name ?? a.user_created.first_name}
                        </div>
                        <div className='tw:text-xs opacity-50 tw:text-zinc-500'>
                          {timeAgo(a.date_created)}
                        </div>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div>
                    <div className='font-bold'>{a.user_created.first_name} </div>
                    <div className='tw:text-xs opacity-50 tw:text-zinc-500'>
                      {timeAgo(a.date_created)}
                    </div>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
