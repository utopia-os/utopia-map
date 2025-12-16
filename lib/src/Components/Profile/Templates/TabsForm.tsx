/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable react/prop-types */
import { useNavigate } from 'react-router-dom'

import { RichTextEditor } from '#components/Input/RichTextEditor'
import { useUpdateItem } from '#components/Map/hooks/useItems'
import { PopupStartEndInput, TextView } from '#components/Map/Subcomponents/ItemPopupComponents'
import { ActionButton } from '#components/Profile/Subcomponents/ActionsButton'
import { LinkedItemsHeaderView } from '#components/Profile/Subcomponents/LinkedItemsHeaderView'
import { TagsWidget } from '#components/Profile/Subcomponents/TagsWidget'
import { Tabs } from '#components/Templates/Tabs'

export const TabsForm = ({
  item,
  state,
  setState,
  updatePermission,
  linkItem,
  unlinkItem,
  loading,
  setUrlParams,
}) => {
  const updateItem = useUpdateItem()
  const navigate = useNavigate()

  return (
    <div className='tw:flex tw:flex-col tw:flex-1 tw:min-h-0 tw:mt-4'>
      <Tabs
        setUrlParams={setUrlParams}
        items={[
          {
            title: 'Info',
            component: (
              <div
                className={`tw:flex tw:flex-col tw:flex-1 tw:min-h-0 ${item.layer.itemType.show_start_end_input && 'tw:pt-4'}`}
              >
                {item.layer.itemType.show_start_end_input && (
                  <PopupStartEndInput
                    item={item}
                    showLabels={true}
                    updateEndValue={(e) =>
                      setState((prevState) => ({
                        ...prevState,
                        end: e,
                      }))
                    }
                    updateStartValue={(s) =>
                      setState((prevState) => ({
                        ...prevState,
                        start: s,
                      }))
                    }
                  ></PopupStartEndInput>
                )}

                <RichTextEditor
                  labelTitle='About'
                  placeholder='about ...'
                  defaultValue={item?.text ? item.text : ''}
                  updateFormValue={(v) =>
                    setState((prevState) => ({
                      ...prevState,
                      text: v,
                    }))
                  }
                  containerStyle='tw:pt-2 tw:flex-1 tw:min-h-36 tw:max-h-136'
                />
                <RichTextEditor
                  labelTitle='Contact Info'
                  labelStyle={'tw:text-base-content/50'}
                  placeholder='contact info ...'
                  defaultValue={state.contact || ''}
                  updateFormValue={(c) =>
                    setState((prevState) => ({
                      ...prevState,
                      contact: c,
                    }))
                  }
                  containerStyle='tw:pt-2 tw:h-36 tw:flex-none'
                  showMenu={false}
                />
              </div>
            ),
          },
          {
            title: 'Offers & Needs',
            component: (
              <div className='tw:h-full'>
                <div className='tw:w-full tw:h-[calc(50%-0.75em)] tw:mb-4'>
                  <TagsWidget
                    defaultTags={state.offers}
                    onUpdate={(v) =>
                      setState((prevState) => ({
                        ...prevState,
                        offers: v,
                      }))
                    }
                    placeholder='enter your offers'
                    containerStyle='tw:bg-transparent tw:w-full tw:h-full tw:mt-3 tw:text-xs tw:h-[calc(100%-1rem)] tw:min-h-[5em] tw:pb-2 tw:overflow-auto'
                  />
                </div>
                <div className='tw:w-full tw:h-[calc(50%-1.5em)]'>
                  <TagsWidget
                    defaultTags={state.needs}
                    onUpdate={(v) =>
                      setState((prevState) => ({
                        ...prevState,
                        needs: v,
                      }))
                    }
                    placeholder='enter your needs'
                    containerStyle='tw:bg-transparent tw:w-full tw:h-full tw:mt-3 tw:text-xs tw:h-[calc(100%-1rem)] tw:min-h-[5em] tw:pb-2 tw:overflow-auto'
                  />
                </div>
              </div>
            ),
          },
          {
            title: 'Links',
            component: (
              <div className='tw:h-full'>
                <div className='tw:grid tw:grid-cols-1 tw:sm:grid-cols-2 tw:md:grid-cols-1 tw:lg:grid-cols-1 tw:xl:grid-cols-1 tw:2xl:grid-cols-2 tw:mb-4'>
                  {state.relations &&
                    state.relations.map((i) => (
                      <div
                        key={i.id}
                        className='tw:cursor-pointer tw:card tw:bg-base-200 tw:border-[1px] tw:border-base-300 tw:card-body tw:shadow-xl tw:text-base-content tw:mx-4 tw:p-6 tw:mb-4'
                        onClick={() => {
                          void navigate('/item/' + i.id)
                        }}
                      >
                        <LinkedItemsHeaderView
                          unlinkPermission={updatePermission}
                          item={i}
                          unlinkCallback={(id) => unlinkItem(id, item, updateItem)}
                          loading={loading}
                        />
                        <div className='tw:overflow-y-auto tw:overflow-x-hidden tw:max-h-64 fade'>
                          <TextView truncate itemId={item.id} />
                        </div>
                      </div>
                    ))}
                  {updatePermission && (
                    <ActionButton
                      customStyle='tw:bottom-24!'
                      collection='items'
                      item={item}
                      existingRelations={state.relations}
                      triggerItemSelected={(id) => linkItem(id, item, updateItem)}
                    ></ActionButton>
                  )}
                </div>
              </div>
            ),
          },
        ]}
      ></Tabs>
    </div>
  )
}
