/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable import-x/order */
/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import type { Tag, LayerProps } from 'utopia-ui'

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
import { config } from './config'
import { InviteApi } from './api/inviteApi'
import { MapPinIcon } from '@heroicons/react/24/solid'

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
  const [error, setError] = useState<string | null>(null)

  const retryConnection = () => {
    setError(null)
    setLoading(true)
    if (mapApiInstance) {
      getMap()
    }
  }

  const [embedded, setEmbedded] = useState<boolean>(true)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const embedded = params.get('embedded')
    embedded !== 'true' && setEmbedded(false)
  }, [location])

  useEffect(() => {
    setPermissionsApiInstance(new permissionsApi())
    // TODO: it should be mapId instead of mapUrl, which then in turn can be an URL
    const mapUrl =
      config.mapUrl === 'CURRENT_WINDOW_LOCATION' ? window.location.origin : config.mapUrl
    setMapApiInstance(new mapApi(mapUrl))
    setAttestationApi(new itemsApi<any>('attestations'))
  }, [])

  useEffect(() => {
    mapApiInstance && getMap()
  }, [mapApiInstance])

  const getMap = async () => {
    try {
      const map = await mapApiInstance?.getItems()
      map && setMap(map)
      map && map != 'null' && setLayersApiInstance(new layersApi(map.id))
      map && map != 'null' && map.own_tag_space
        ? setTagsApi(new itemsApi<Tag>('tags', undefined, map.id))
        : setTagsApi(new itemsApi<Tag>('tags'))
      // eslint-disable-next-line no-catch-all/no-catch-all
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('Failed to load map:', error)
      setError(
        typeof error === 'string'
          ? error
          : (error?.errors?.length > 0 ? error.errors[0]?.message : null) ||
              error?.message ||
              'Failed to connect to the server. Please check your connection and try again.',
      )
      setLoading(false)
      // Don't rethrow since we're handling the error by setting error state
    }
  }

  useEffect(() => {
    layersApiInstance && getLayers()
  }, [layersApiInstance])

  const getLayers = async () => {
    try {
      const layers = await layersApiInstance?.getItems()
      layers && setLayers(layers)
      setLayerPageRoutes(
        layers
          ?.filter((l: LayerProps) => l.listed)
          .map((l: LayerProps) => ({
            path: '/' + l.name, // url
            icon: l.markerIcon?.image ? (
              <SVG
                src={`${config.apiUrl}/assets/${l.markerIcon.image_outline ?? l.markerIcon.image}`}
                style={{
                  width: `${(l.markerIcon.size ?? 18) * 1.3}px`,
                  height: `${(l.markerIcon.size ?? 18) * 1.3}px`,
                }}
                preProcessor={(code: string) =>
                  code.replace(/stroke=".*?"/g, 'stroke="currentColor"')
                }
              />
            ) : (
              <MapPinIcon className='tw:w-6 tw:h-6' />
            ),
            name: l.name, // name that appear in Sidebar
            color: l.menuColor,
          })),
      )
      // eslint-disable-next-line no-catch-all/no-catch-all
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('Failed to load layers:', error)
      setError(
        typeof error === 'string'
          ? error
          : (error?.errors?.length > 0 ? error.errors[0]?.message : null) ||
              error?.message ||
              'Failed to load map layers. Please check your permissions and try again.',
      )
      setLoading(false)
      // Don't rethrow since we're handling the error by setting error state
    }
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
      link.href = map?.logo && config.apiUrl + '/assets/' + map.logo // Specify the path to your favicon
    }

    // Only set loading to false when both map and layers are successfully loaded
    if (map && layers) {
      setLoading(false)
    }
  }, [map, layers])

  const currentUrl = window.location.href
  const bottomRoutes = getBottomRoutes(currentUrl)

  if (map && layers)
    return (
      <div className='App tw:overflow-x-hidden'>
        <AuthProvider userApi={userApi} inviteApi={inviteApi}>
          <AppShell
            assetsApi={new assetsApi(config.apiUrl + '/assets/')}
            appName={map.name}
            embedded={embedded}
            openCollectiveApiKey={config.openCollectiveApiKey}
            hideSignup={map.hide_signup}
          >
            <Permissions api={permissionsApiInstance} adminRole={config.adminRole} />
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
                  <Route
                    path='login'
                    element={
                      <LoginPage
                        showRequestPassword={map.show_request_password}
                        inviteApi={inviteApi}
                      />
                    }
                  />
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
                  {layers.map((l: LayerProps) => (
                    <Route
                      key={l.id}
                      path={l.name}
                      element={
                        <OverlayItemsIndexPage
                          layerName={l.name}
                          url={l.itemType.custom_profile_url ? '/' : '/item/'}
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
  else if (error)
    return (
      <div className='tw:flex tw:items-center tw:justify-center tw:h-screen tw:bg-base-100'>
        <div className='tw:max-w-md tw:mx-auto tw:p-6 tw:text-center'>
          <div className='tw:mb-4'>
            <svg
              className='tw:w-16 tw:h-16 tw:mx-auto tw:text-error tw:mb-4'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z'
              />
            </svg>
          </div>
          <h2 className='tw:text-xl tw:font-semibold tw:text-base-content tw:mb-2'>
            Connection Error
          </h2>
          <p className='tw:text-base-content/70 tw:mb-6'>{error}</p>
          <button onClick={retryConnection} className='tw:btn tw:btn-primary'>
            Try Again
          </button>
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
