/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { TextView, useAuth } from 'utopia-ui'

import { config } from './config'

interface ChapterProps {
  clickAction1: () => void
  map?: any
}

const ROOT_PATH = '/'

export function Welcome1({ clickAction1, map }: ChapterProps) {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  return (
    <>
      {map.custom_text ? (
        <>
          <TextView rawText={map.custom_text}></TextView>
          <div className='tw:grid tw:mt-4'>
            {isAuthenticated ? (
              <label
                className='tw:btn tw:btn-primary tw:place-self-end'
                onClick={() => {
                  clickAction1()
                }}
              >
                Close
              </label>
            ) : (
              <label
                className='tw:btn tw:btn-primary tw:place-self-end'
                onClick={() => {
                  clickAction1()
                  void navigate('/login')
                }}
              >
                Login
              </label>
            )}
          </div>
        </>
      ) : (
        <>
          <h3 className='tw:font-bold tw:text-lg'>Welcome to {map?.name || 'Utopia Map'}</h3>
          <img
            className='tw:float-right tw:w-32 tw:m-2'
            src={config.apiUrl + '/assets/' + map.logo}
          ></img>
          <p className='tw:py-3'>
            It is a tool for collaborative mapping to connect local initiatives, people and events.
          </p>
          <p className='tw:py-1'>
            Join us and grow the network by adding projects and events to the map.
          </p>
          <p className='tw:py-1'>Create your personal profile and place it on the map.</p>
          <div className='tw:grid tw:mt-4'>
            {isAuthenticated ? (
              <label
                className='tw:btn tw:btn-primary tw:place-self-end'
                onClick={() => {
                  clickAction1()
                }}
              >
                Close
              </label>
            ) : (
              <label
                className='tw:btn tw:btn-primary tw:place-self-end'
                onClick={() => {
                  clickAction1()
                  void navigate('/login')
                }}
              >
                Login
              </label>
            )}
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
  const { pathname } = useLocation()
  const autoOpenedModal = useRef(false)

  useEffect(() => {
    const myModal = document.getElementById('my_modal_3')
    if (!(myModal instanceof HTMLDialogElement)) {
      return
    }

    if (map.info_open && pathname === ROOT_PATH && !myModal.open) {
      myModal.showModal()
      autoOpenedModal.current = true
      return
    }

    if (pathname !== ROOT_PATH && autoOpenedModal.current && myModal.open) {
      myModal.close()
      autoOpenedModal.current = false
    }
  }, [map.info_open, pathname])

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
