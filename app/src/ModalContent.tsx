/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { useEffect, useState } from 'react'
import { TextView } from 'utopia-ui'

interface ChapterProps {
  clickAction1: () => void
  map?: any
}

export function Welcome1({ clickAction1, map }: ChapterProps) {
  return (
    <>
      {map.custom_text ? (
        <>
          <TextView rawText={map.custom_text}></TextView>
          <div className='tw:grid'>
            <label
              className='tw:btn tw:btn-primary tw:place-self-end tw:mt-4'
              onClick={() => clickAction1()}
            >
              Close
            </label>
          </div>
        </>
      ) : (
        <>
          <h3 className='tw:font-bold tw:text-lg'>Welcome to {map?.name || 'Utopia Map'}</h3>
          <img
            className='tw:float-right tw:w-32 tw:m-2'
            src={'https://api.utopia-lab.org/assets/' + map.logo}
          ></img>
          <p className='tw:py-3'>
            It is a tool for collaborative mapping to connect local initiatives, people and events.
          </p>
          <p className='tw:py-1'>
            Join us and grow the network by adding projects and events to the map.
          </p>
          <p className='tw:py-1'>Create your personal profile and place it on the map.</p>
          <div className='tw:grid'>
            <label
              className='tw:btn tw:btn-primary tw:place-self-end tw:mt-4'
              onClick={() => clickAction1()}
            >
              Close
            </label>
          </div>
        </>
      )}
    </>
  )
}

const close = () => {
  const myModal = document.getElementById('my_modal_3') as HTMLDialogElement
  myModal.close()
}

export const ModalContent = ({ map }: { map: any }) => {
  useEffect(() => {
    const myModal = document.getElementById('my_modal_3') as HTMLDialogElement
    if (map.info_open) {
      myModal.showModal()
    }
  }, [map.info_open])

  const [chapter, setChapter] = useState<number>(1)
  // const setQuestsOpen = useSetQuestOpen()

  const ActiveChapter = () => {
    switch (chapter) {
      case 1:
        return (
          <Welcome1
            map={map}
            clickAction1={() => {
              close()
              setTimeout(() => {
                //  setQuestsOpen(true);
                setChapter(1)
              }, 1000)
            }}
          />
        )
      default:
        return <></>
    }
  }

  return <ActiveChapter />
}
