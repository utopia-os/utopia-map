/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable import/order */
/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import type { Tag } from 'utopia-ui'

import {
  AppShell,
  SideBar,
  Content,
  AuthProvider,
  Modal,
  InvitePage,
  LoginPage,
  SignupPage,
  Quests,
  RequestPasswordPage,
  SetNewPasswordPage,
  OverlayItemsIndexPage,
  Permissions,
  Tags,
  SelectUser,
  AttestationForm,
  MarketView,
  SVG,
  LoadingMapOverlay,
  ProfileForm,
  ProfileView,
  UserSettings,
} from 'utopia-ui'

import { Route, Routes } from 'react-router-dom'

import './App.css'
import { Suspense, useEffect, useState } from 'react'

import { assetsApi } from './api/assetsApi'
import { itemsApi } from './api/itemsApi'
import { layersApi } from './api/layersApi'
import { mapApi } from './api/mapApi'
import { permissionsApi } from './api/permissionsApi'
import { UserApi } from './api/userApi'
import { ModalContent } from './ModalContent'
import { Landingpage } from './pages/Landingpage'
import MapContainer from './pages/MapContainer'
import { getBottomRoutes, routes } from './routes/sidebar'
import { config } from '@/config'
import { InviteApi } from './api/inviteApi'

const userApi = new UserApi()
const inviteApi = new InviteApi(userApi)

function App() {
  const [permissionsApiInstance, setPermissionsApiInstance] = useState<permissionsApi>()
  const [tagsApi, setTagsApi] = useState<itemsApi<Tag>>()
  const [mapApiInstance, setMapApiInstance] = useState<mapApi>()
  const [layersApiInstance, setLayersApiInstance] = useState<layersApi>()
  const [attestationApi, setAttestationApi] = useState<itemsApi<any>>()

  const [map, setMap] = useState<any>()
  const [layers, setLayers] = useState<any>()
  const [layerPageRoutes, setLayerPageRoutes] = useState<any>()
  const [loading, setLoading] = useState<boolean>(true)

  const [embedded, setEmbedded] = useState<boolean>(true)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const embedded = params.get('embedded')
    embedded !== 'true' && setEmbedded(false)
  }, [location])

  useEffect(() => {
    setPermissionsApiInstance(new permissionsApi())
    setMapApiInstance(new mapApi(window.location.origin))
    setAttestationApi(new itemsApi<any>('attestations'))
  }, [])

  useEffect(() => {
    mapApiInstance && getMap()
  }, [mapApiInstance])

  const getMap = async () => {
    const map = await mapApiInstance?.getItems()
    map && setMap(map)
    map && map != 'null' && setLayersApiInstance(new layersApi(map.id))
    map && map != 'null' && map.own_tag_space
      ? setTagsApi(new itemsApi<Tag>('tags', undefined, map.id))
      : setTagsApi(new itemsApi<Tag>('tags'))
  }

  useEffect(() => {
    layersApiInstance && getLayers()
  }, [layersApiInstance])

  const getLayers = async () => {
    const layers = await layersApiInstance?.getItems()
    layers && setLayers(layers)
    setLayerPageRoutes(
      layers
        ?.filter((l: any) => l.listed)
        .map((l: any) => ({
          path: '/' + l.name, // url
          icon: (
            <SVG
              src={'https://api.utopia-lab.org/assets/' + l.indexIcon}
              className='tw:w-6 tw:h-6'
              preProcessor={(code: string) =>
                code.replace(/stroke=".*?"/g, 'stroke="currentColor"')
              }
            />
          ),
          name: l.name, // name that appear in Sidebar
        })),
    )
  }

  useEffect(() => {
    if (map && map.name) {
      document.title = map?.name && map.name
      let link: HTMLLinkElement = document.querySelector("link[rel~='icon']")!
      if (!link) {
        link = document.createElement('link')
        link.rel = 'icon'
        document.getElementsByTagName('head')[0].appendChild(link)
      }
      link.href = map?.logo && 'https://api.utopia-lab.org/assets/' + map.logo // Specify the path to your favicon
    }

    setLoading(false)
  }, [map])

  const currentUrl = window.location.href
  const bottomRoutes = getBottomRoutes(currentUrl)

  if (map && layers)
    return (
      <div className='App tw:overflow-x-hidden'>
        <AuthProvider userApi={userApi} inviteApi={inviteApi}>
          <AppShell
            assetsApi={new assetsApi('https://api.utopia-lab.org/assets/')}
            appName={map.name}
            embedded={embedded}
            openCollectiveApiKey={config.openCollectiveApiKey}
          >
            <Permissions
              api={permissionsApiInstance}
              adminRole='8ed0b24e-3320-48cd-8444-bc152304e580'
            ></Permissions>
            {tagsApi && <Tags api={tagsApi}></Tags>}
            <Modal>
              <ModalContent map={map} />
            </Modal>
            <SideBar routes={[...routes, ...layerPageRoutes]} bottomRoutes={bottomRoutes} />
            <Content>
              <Quests />
              <Routes>
                <Route path='/*' element={<MapContainer map={map} layers={layers} />}>
                  <Route path='invite/:id' element={<InvitePage inviteApi={inviteApi} />} />
                  <Route path='login' element={<LoginPage inviteApi={inviteApi} />} />
                  <Route path='signup' element={<SignupPage />} />
                  <Route
                    path='reset-password'
                    element={<RequestPasswordPage resetUrl={map.url + '/set-new-password/'} />}
                  />
                  <Route path='set-new-password' element={<SetNewPasswordPage />} />
                  <Route
                    path='item/*'
                    element={
                      <Suspense fallback={<LoadingMapOverlay />}>
                        <ProfileView attestationApi={attestationApi} />
                      </Suspense>
                    }
                  />
                  <Route
                    path='edit-item/*'
                    element={
                      <Suspense fallback={<LoadingMapOverlay />}>
                        <ProfileForm />
                      </Suspense>
                    }
                  />
                  <Route
                    path='user-settings'
                    element={
                      <Suspense fallback={<LoadingMapOverlay />}>
                        <UserSettings />
                      </Suspense>
                    }
                  />
                  <Route path='landingpage' element={<Landingpage />} />
                  <Route path='market' element={<MarketView />} />
                  <Route path='select-user' element={<SelectUser />} />
                  {/* <Route
                    path='onboarding'
                    element={
                      <MapOverlayPage
                        backdrop
                        className='max-w-[calc(100vw-32px)] md:max-w-md h-[calc(100vh-96px)] md:h-fit'
                      >
                        <Onboarding />
                      </MapOverlayPage>
                    }
                  /> */}
                  <Route
                    path='attestation-form'
                    element={<AttestationForm api={attestationApi} />}
                  />
                  {layers.map((l: any) => (
                    <Route
                      key={l.id}
                      path={l.name}
                      element={
                        <OverlayItemsIndexPage
                          layerName={l.name}
                          url={'/item/'}
                          parameterField={'id'}
                        />
                      }
                    />
                  ))}
                </Route>
              </Routes>
            </Content>
          </AppShell>
        </AuthProvider>
      </div>
    )
  else if (map == 'null' && !loading)
    return (
      <div className='tw:flex tw:items-center tw:justify-center tw:h-screen'>
        <div>
          <p className='tw:text-xl tw:font-semibold'>This map does not exist</p>
        </div>
      </div>
    )
  else
    return (
      <div className='outer'>
        <img className='pulse-loader tw-h-[96px]' src='/3markers-globe.svg' />
        <br />
        <span className='tw:loader'></span>
      </div>
    )
}

export default App
