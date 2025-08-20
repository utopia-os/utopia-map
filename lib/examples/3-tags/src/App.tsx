import { UtopiaMap, Layer, Tags } from "utopia-ui"
import { events, places, tags } from "./sample-data"

function App() {
  return (
    <UtopiaMap center={[50.6, 15.5]} zoom={5} height='100dvh' width="100dvw">
    <Layer
      id="eea49637-1232-42f9-aec9-77b3187d5d7c"
      name='events'
      markerIcon='calendar'
      markerShape='square'
      markerDefaultColor='#700'
      data={events} />
    <Layer
      id="9b880bc6-2ad0-439a-b3b6-e7907d1d824a"
      name='places'
      markerIcon='point'
      markerShape='circle'
      markerDefaultColor='#007'
      data={places} />
      <Tags data={tags}/>
  </UtopiaMap>
  )
}

export default App