/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable import/no-relative-parent-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable new-cap */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapOverlayPage } from 'utopia-ui'

import { itemsApi } from '../api/itemsApi'

export const Landingpage = () => {
  const [isLandingpageVisible, setIsLandingpageVisible] = useState(true)
  const [isBoxVisible, setIsBoxVisible] = useState(true)
  const [isPhoneVisible, setIsPhoneVisible] = useState(true)

  const [featuresApi, setFeaturesApi] = useState<itemsApi<any>>()
  const [features, setFeatures] = useState<any[]>()

  const [teamApi, setTeamApi] = useState<itemsApi<any>>()
  const [team, setTeam] = useState<any[]>()

  const loadFeatures = async () => {
    const items = await featuresApi?.getItems()
    setFeatures(items as any)
  }

  const loadTeam = async () => {
    const items = await teamApi?.getItems()
    setTeam(items as any)
  }

  useEffect(() => {
    setFeaturesApi(
      new itemsApi<any>('features', undefined, undefined, { status: { _eq: 'published' } }),
    )
    setTeamApi(new itemsApi<any>('team'))
    loadTeam()
    loadFeatures()
  }, [])

  useEffect(() => {
    loadFeatures()
  }, [featuresApi])

  useEffect(() => {
    loadTeam()
  }, [teamApi])

  const navigate = useNavigate()

  const startGame = () => {
    setTimeout(() => {
      setIsBoxVisible(false)
    }, 200)
    setTimeout(() => {
      setIsPhoneVisible(false)
    }, 200)
    setTimeout(() => {
      setIsLandingpageVisible(false)
    }, 500)
    setTimeout(() => {
      navigate('/')
    }, 1500)
  }

  return (
    <MapOverlayPage
      className={`rounded-none! overflow-y-auto p-0! fadeable-div flex-none ${isLandingpageVisible ? '' : 'div-hidden'}`}
      card={false}
    >
      <div className='hero min-h-full text-base'>
        <div className='hero-content text-center flex flex-col place-items-center p-0'>
          <div
            className='bg-no-repeat bg-center w-full'
            style={{ backgroundImage: 'url(bg1.webp)' }}
          >
            <div className='min-h-[calc(100vh-60px)] flex flex-row items-center justify-center '>
              <div
                className={`max-w-md text-center bg-black p-8 m-8 bg-opacity-50 text-white backdrop-blur-xs rounded-xl movable-div ${isBoxVisible ? '' : 'move-out-left'}`}
              >
                <h1 className='text-5xl font-bold'>Utopia Game</h1>
                <p className='py-6'>
                  ist mehr als nur ein Spiel. Es ist eine Bewegung, die darauf abzielt, die Spieler
                  aus ihren virtuellen Welten zu befreien und sie zu inspirieren, das echte Leben zu
                  erkunden, Fähigkeiten zu entwickeln und die Welt um sie herum zu gestalten. Bist
                  du bereit, Teil dieser Revolution zu werden?{' '}
                </p>
                <div className='btn text-white! btn-primary' onClick={startGame}>
                  Play ▶
                </div>
              </div>
              <div
                className={`mockup-phone m-8 hidden lg:block movable-div ${isPhoneVisible ? '' : 'move-out-right'}`}
              >
                <div className='camera'></div>
                <div className='display'>
                  my-8
                  <div className='artboard artboard-demo phone-1'>
                    <iframe src='/' height={568} width={320}></iframe>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <section className='min-h-[50em] p-8 flex h-full items-center justify-center'>
            <ul className='my-8 grid gap-y-8 gap-x-12 sm:grid-cols-2 lg:grid-cols-3'>
              {features?.map((item, idx) => (
                <li key={idx} className='space-y-3'>
                  <div className='w-12tw-card tw-card-body h-12 mx-auto bg-transparent! text-indigo-600 rounded-full flex items-center justify-center text-5xl'>
                    {item.symbol}
                  </div>
                  <h4 className='text-lg  font-semibold'>{item.heading}</h4>
                  <p>{item.text}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className='py-14 min-h-[40em] p-8 flex h-full items-center justify-center mb-28'>
            <div className='max-w-(--breakpoint-xl) mx-auto text-center'>
              <div className='max-w-xl mx-auto'>
                <h3 className='text-3xl font-semibold sm:text-4xl'>Meet our team</h3>
                <p className='mt-3'>
                  Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem
                  Ipsum has been the industry's standard dummy.
                </p>
              </div>
              <div className='mt-12'>
                <ul className='grid gap-8 sm:grid-cols-2 md:grid-cols-3'>
                  {team?.map((item, idx) => (
                    <li key={idx}>
                      <div className='w-24 h-24 mx-auto'>
                        <img
                          src={`https://api.utopia-lab.org/assets/${item.image}`}
                          className='w-full h-full rounded-full'
                          alt=''
                        />
                      </div>
                      <div className='mt-2'>
                        <h4 className='font-semibold sm:text-lg'>{item.name}</h4>
                        <p className='text-indigo-600'>{item.role}</p>
                        <p className='mt-2'>{item.text}</p>
                        <div className='mt-4 flex justify-center gap-4'></div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
      <footer className='text-gray-500 bg-base-200 px-4 py-5 w-full mx-auto md:px-8 text-base'>
        <div className='mt-8 items-center justify-center flex'>
          <div className='mt-6 sm:mt-0'>
            <ul className='flex items-center space-x-4'>
              <li className='w-8 h-8 border-current bg-white rounded-full flex items-center justify-center'>
                <a href='https://t.me/UtopiaMap'>
                  <svg
                    stroke='currentColor'
                    fill='#1d93d2'
                    strokeWidth='0'
                    viewBox='0 0 512 512'
                    height='1.4rem'
                    width='1.4rem'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path d='M446.7 98.6l-67.6 318.8c-5.1 22.5-18.4 28.1-37.3 17.5l-103-75.9-49.7 47.8c-5.5 5.5-10.1 10.1-20.7 10.1l7.4-104.9 190.9-172.5c8.3-7.4-1.8-11.5-12.9-4.1L117.8 284 16.2 252.2c-22.1-6.9-22.5-22.1 4.6-32.7L418.2 66.4c18.4-6.9 34.5 4.1 28.5 32.2z'></path>
                  </svg>
                </a>
              </li>

              <li className='w-8 h-8 border-current bg-white rounded-full flex items-center justify-center'>
                <a href='mailto:hello@utopia-lab.org'>
                  <svg
                    stroke='currentColor'
                    fill='#333'
                    strokeWidth='0'
                    viewBox='0 0 24 24'
                    height='1.25rem'
                    width='1.25rem'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path fill='none' d='M0 0h24v24H0z'></path>
                    <path d='M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z'></path>
                  </svg>{' '}
                </a>
              </li>

              <li className='w-8 h-8 border-current bg-white rounded-full flex items-center justify-center'>
                <a href='https://twitter.com/UtopiaMapGame/' className='text-white'>
                  <svg
                    className='svg-icon w-[1.4rem] h-[1.4rem] text-[#1d93d2]'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fill='currentColor'
                      d='M18.258,3.266c-0.693,0.405-1.46,0.698-2.277,0.857c-0.653-0.686-1.586-1.115-2.618-1.115c-1.98,0-3.586,1.581-3.586,3.53c0,0.276,0.031,0.545,0.092,0.805C6.888,7.195,4.245,5.79,2.476,3.654C2.167,4.176,1.99,4.781,1.99,5.429c0,1.224,0.633,2.305,1.596,2.938C2.999,8.349,2.445,8.19,1.961,7.925C1.96,7.94,1.96,7.954,1.96,7.97c0,1.71,1.237,3.138,2.877,3.462c-0.301,0.08-0.617,0.123-0.945,0.123c-0.23,0-0.456-0.021-0.674-0.062c0.456,1.402,1.781,2.422,3.35,2.451c-1.228,0.947-2.773,1.512-4.454,1.512c-0.291,0-0.575-0.016-0.855-0.049c1.588,1,3.473,1.586,5.498,1.586c6.598,0,10.205-5.379,10.205-10.045c0-0.153-0.003-0.305-0.01-0.456c0.7-0.499,1.308-1.12,1.789-1.827c-0.644,0.28-1.334,0.469-2.06,0.555C17.422,4.782,17.99,4.091,18.258,3.266'
                    ></path>
                  </svg>
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className='mt-8 flex item  s-center justify-center'>&copy; 2024</div>
      </footer>
    </MapOverlayPage>
  )
}
