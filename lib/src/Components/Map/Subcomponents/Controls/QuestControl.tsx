import FistSVG from '#assets/fist.svg'
import { useQuestsOpen, useSetQuestOpen } from '#components/Gaming/hooks/useQuests'

export function QuestControl() {
  const questsOpen = useQuestsOpen()
  const setQuestsOpen = useSetQuestOpen()

  return (
    <>
      {questsOpen ? (
        ''
      ) : (
        <div
          className='tw:card tw:bg-base-100 tw:shadow-xl tw:my-2 tw:w-10'
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          <div
            className='tw:card-body tw:hover:bg-slate-300 tw:rounded-2xl tw:p-2 tw:h-10 tw:w-10 tw:transition-all tw:duration-300 tw:hover:cursor-pointer'
            onClick={() => {
              setQuestsOpen(true)
            }}
          >
            <img src={FistSVG} alt='Quests' className='tw:h-[2em]' />
          </div>
        </div>
      )}
    </>
  )
}
