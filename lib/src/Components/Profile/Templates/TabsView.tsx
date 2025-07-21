/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAppState } from '#components/AppShell/hooks/useAppState'
import { useAddFilterTag } from '#components/Map/hooks/useFilter'
import { useItems } from '#components/Map/hooks/useItems'
import {
  StartEndView,
  TextPreview,
  TextView,
} from '#components/Map/Subcomponents/ItemPopupComponents'
import { ActionButton } from '#components/Profile/Subcomponents/ActionsButton'
import { LinkedItemsHeaderView } from '#components/Profile/Subcomponents/LinkedItemsHeaderView'
import { TagView } from '#components/Templates/TagView'
import { timeAgo } from '#utils/TimeAgo'

import type { Item } from '#types/Item'
import type { Tag } from '#types/Tag'

export const TabsView = ({
  attestations,
  item,
  offers,
  needs,
  relations,
  updatePermission,
  loading,
  linkItem,
  unlinkItem,
}: {
  attestations: any[]
  item: Item
  offers: Tag[]
  needs: Tag[]
  relations: Item[]
  updatePermission: boolean
  loading: boolean
  linkItem: (id: string) => Promise<void>
  unlinkItem: (id: string) => Promise<void>
}) => {
  const addFilterTag = useAddFilterTag()
  const [activeTab, setActiveTab] = useState<number>(0)
  const navigate = useNavigate()

  const [addItemPopupType] = useState<string>('')

  const items = useItems()
  const appState = useAppState()
  const getUserProfile = (id: string) => {
    return items.find((i) => i.user_created?.id === id && i.layer?.userProfileLayer)
  }

  useEffect(() => {
    scroll()
  }, [addItemPopupType])

  function scroll() {
    tabRef.current?.scrollIntoView()
  }

  const tabRef = useRef<HTMLFormElement>(null)

  const updateActiveTab = useCallback(
    (id: number) => {
      setActiveTab(id)

      const params = new URLSearchParams(window.location.search)
      params.set('tab', `${id}`)
      const newUrl = location.pathname + '?' + params.toString()
      window.history.pushState({}, '', newUrl)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [location.pathname],
  )

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const urlTab = params.get('tab')
    setActiveTab(urlTab ? Number(urlTab) : 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search])

  return (
    <div role='tablist' className='tw:tabs tw:tabs-lift tw:mt-2 tw:mb-2 tw:px-6'>
      <input
        type='radio'
        name='my_tabs_2'
        role='tab'
        className={'tw:tab tw:font-bold tw:ps-2! tw:pe-2! '}
        aria-label={`${item.layer?.itemType.icon_as_labels && activeTab !== 0 ? '📝' : '📝\u00A0Info'}`}
        checked={activeTab === 0 && true}
        onChange={() => updateActiveTab(0)}
      />
      <div
        role='tabpanel'
        className='tw:tab-content tw:bg-base-100 tw:rounded-box tw:!h-[calc(100dvh-280px)] tw:overflow-y-auto fade tw:pt-2 tw:pb-4 tw:mb-4 tw:overflow-x-hidden'
      >
        {item.layer?.itemType.show_start_end && (
          <div className='tw:max-w-xs'>
            <StartEndView item={item}></StartEndView>
          </div>
        )}
        <TextView rawText={item.text} />
        <div className='tw:h-4'></div>
        <TextView rawText={item.contact} />
      </div>
      {item.layer?.itemType.questlog && (
        <>
          <input
            type='radio'
            name='my_tabs_2'
            role='tab'
            className={'tw:tab tw:font-bold tw:ps-2! tw:pe-2!'}
            aria-label={`${item.layer.itemType.icon_as_labels && activeTab !== 3 ? '❤️' : '❤️\u00A0Trust'}`}
            checked={activeTab === 3 && true}
            onChange={() => updateActiveTab(3)}
          />
          <div
            role='tabpanel'
            className='tw:tab-content tw:bg-base-100 tw:rounded-box tw:!h-[calc(100dvh-280px)] tw:overflow-y-auto fade tw:pt-2 tw:pb-4 tw:mb-4 tw:overflow-x-hidden'
          >
            <table className='sm:tw:table-sm md:tw:table-md tw:w-full'>
              <tbody>
                {attestations
                  .filter((a) => a.to.some((t) => t.directus_users_id === item.user_created?.id))
                  .sort(
                    (a, b) =>
                      new Date(b.date_created).getTime() - new Date(a.date_created).getTime(),
                  )
                  .map((a, i) => (
                    <tr key={i}>
                      <td>
                        <div
                          className={`tw:cursor-pointer tw:text-3xl tw:mask ${a.shape === 'squircle' ? 'tw:mask-squircle' : a.shape === 'circle' ? 'tw:mask-circle' : 'tw:mask-hexagon-2'} tw:p-2 tw:my-2 tw:mr-2 tw:shadow-xl`}
                          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
                          <Link to={'/item/' + getUserProfile(a.user_created.id)?.id}>
                            <div className='flex items-center gap-3'>
                              <div className='tw:avatar'>
                                <div className='tw:mask tw:rounded-full tw:h-8 tw:w-8 tw:mr-2'>
                                  {getUserProfile(a.user_created.id)?.image && (
                                    <img
                                      src={
                                        appState.assetsApi.url +
                                        getUserProfile(a.user_created.id)?.image
                                      }
                                      alt='Avatar'
                                    />
                                  )}
                                </div>
                              </div>
                              <div>
                                <div className='font-bold'>
                                  {getUserProfile(a.user_created.id)?.name ??
                                    a.user_created.first_name}{' '}
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
        </>
      )}
      {item.layer?.itemType.offers_and_needs && (
        <>
          <input
            type='radio'
            name='my_tabs_2'
            role='tab'
            className={`tw:tab tw:font-bold tw:ps-2! tw:pe-2! ${!(item.layer.itemType.icon_as_labels && activeTab !== 1) && 'tw:min-w-[10.4em]'} `}
            aria-label={`${item.layer.itemType.icon_as_labels && activeTab !== 1 ? '♻️' : '♻️\u00A0Offers & Needs'}`}
            checked={activeTab === 1 && true}
            onChange={() => updateActiveTab(1)}
          />
          <div
            role='tabpanel'
            className='tw:tab-content tw:bg-base-100  tw:rounded-box tw:h-[calc(100dvh-268px)] tw:overflow-y-auto fade tw:pt-4 tw:pb-1'
          >
            <div className='tw:h-full'>
              <div className='tw:grid tw:grid-cols-1'>
                {offers.length > 0 ? (
                  <div className='tw:col-span-1'>
                    <h3 className='tw:-mb-2'>Offers</h3>
                    <div className='tw:flex tw:flex-wrap tw:mb-4'>
                      {offers.map((o) => (
                        <TagView
                          key={o.id}
                          tag={o}
                          onClick={() => {
                            addFilterTag(o)
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  ''
                )}
                {needs.length > 0 ? (
                  <div className='tw:col-span-1'>
                    <h3 className='tw:-mb-2 tw:col-span-1'>Needs</h3>
                    <div className='tw:flex tw:flex-wrap  tw:mb-4'>
                      {needs.map((n) => (
                        <TagView key={n.id} tag={n} onClick={() => addFilterTag(n)} />
                      ))}
                    </div>
                  </div>
                ) : (
                  ''
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {item.layer?.itemType.relations && (
        <>
          <input
            type='radio'
            name='my_tabs_2'
            role='tab'
            className='tw:tab tw:font-bold tw:ps-2! tw:pe-2! '
            aria-label={`${item.layer.itemType.icon_as_labels && activeTab !== 2 ? '🔗' : '🔗\u00A0Links'}`}
            checked={activeTab === 2 && true}
            onChange={() => updateActiveTab(2)}
          />
          <div
            role='tabpanel'
            className='tw:tab-content tw:bg-base-100  tw:rounded-box tw:!h-[calc(100dvh-280px)] tw:overflow-y-auto tw:pt-4 tw:pb-1 tw:-mr-4 tw:-mb-4 tw:overflow-x-hidden'
          >
            <div className='tw:h-full'>
              <div className='tw:grid tw:grid-cols-1 tw:sm:grid-cols-2 tw:md:grid-cols-1 tw:lg:grid-cols-1 tw:xl:grid-cols-1 tw:2xl:grid-cols-2 tw:pb-4'>
                {relations &&
                  relations.map((i) => (
                    <div
                      key={i.id}
                      className='tw:cursor-pointer tw:card tw:bg-base-200 tw:border-[1px] tw:border-base-300 tw:card-body tw:shadow-xl tw:text-base-content tw:p-6 tw:mr-4 tw:mb-4'
                      onClick={() => navigate('/item/' + i.id)}
                    >
                      <LinkedItemsHeaderView
                        unlinkPermission={updatePermission}
                        item={i}
                        unlinkCallback={unlinkItem}
                        loading={loading}
                      />
                      <div className='tw:overflow-y-auto tw:overflow-x-hidden tw:max-h-64 fade'>
                        <TextPreview item={i} />
                      </div>
                    </div>
                  ))}
                {updatePermission && (
                  <ActionButton
                    collection='items'
                    item={item}
                    existingRelations={relations}
                    triggerItemSelected={linkItem}
                  ></ActionButton>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
