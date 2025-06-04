/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useEffect, useState } from 'react'
import { TextView } from 'utopia-ui'

interface ChapterProps {
  clickAction1?: () => void
  clickAction2?: () => void
  map?: any
}

export function Welcome1({ clickAction1, map }: ChapterProps) {
  return (
    <>
      {map.custom_text ? (
        <>
          <TextView rawText={map.custom_text}></TextView>
        </>
      ) : (
        <>
          <h3 className='font-bold text-lg'>Welcome to {map?.name || 'Utopia Map'}</h3>
          <img
            className='float-right w-32 m-2'
            src={'https://api.utopia-lab.org/assets/' + map.logo}
          ></img>
          <p className='py-3'>
            It is a tool for collaborative mapping to connect local initiatives, people and events.
          </p>
          <p className='py-1'>
            Join us and grow the network by adding projects and events to the map.
          </p>
          <p className='py-1'>Create your personal profile and place it on the map.</p>
          <div className='grid'>
            <label className='btn btn-primary place-self-end mt-4' onClick={() => clickAction1!()}>
              Close
            </label>
          </div>
        </>
      )}
    </>
  )
}

export function Welcome2({ clickAction1 }: ChapterProps) {
  return (
    <>
      <h3 className='font-bold text-lg'> Dencentralized Networking</h3>
      <img className='float-right w-32 mx-4 my-2' src='/markers-circle.svg'></img>

      <p className='py-3'>
        Find like-minded people, projects and events. In your neighbourhood and wherever you are!
      </p>
      <p className='py-3'>Onboard new people, places and events</p>
      <div className='grid'>
        <button className='btn place-self-end mt-4' onClick={() => clickAction1!()}>
          next
        </button>
      </div>
    </>
  )
}

export function Welcome3({ clickAction1 }: ChapterProps) {
  return (
    <>
      <h3 className='font-bold text-lg'>Mapping the Change</h3>
      <p className='py-3'>More and more people are waking up to what's really happening. </p>
      <p className='py-1'>
        They are in the process of understanding the potential that is within themselves and within
        the whole mankind.
      </p>
      <img className='float-left w-32 mx-4' src='/3markers-globe.svg'></img>

      <p className='py-1'>
        Starting to reconnect with our Mother Earth and beginning to question things that long times
        have been taken for granted.
      </p>
      <div className='grid'>
        <label className='btn place-self-end mt-4' onClick={() => clickAction1!()}>
          next
        </label>
      </div>
    </>
  )
}

export function Welcome4({ clickAction1 }: ChapterProps) {
  return (
    <>
      <h3 className='font-bold text-lg'> Dezentralized Networks </h3>

      <p className='py-3'>
        Find like-minded people, places and events. In your neighbourhood and wherever you are!
      </p>
      <img className='float-right w-32 mx-4 my-2' src='/network.svg'></img>

      <p className='py-1'>
        Hypnotised, they sit in front of screens in concrete blocks, flooded and disillusioned by
        irrelevant information.
      </p>

      <p className='py-1'>
        From an early age, they are trained to do alienated work and consume unhealthy and
        meaningless products.
      </p>
      <div className='grid'>
        <button className='btn place-self-end mt-4' onClick={() => clickAction1!()}>
          next
        </button>
      </div>
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
      case 2:
        return (
          <Welcome2
            clickAction1={() => {
              setChapter(3)
            }}
          />
        )
      case 3:
        return (
          <Welcome3
            clickAction1={() => {
              setChapter(4)
            }}
          />
        )
      case 4:
        return (
          <Welcome4
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
