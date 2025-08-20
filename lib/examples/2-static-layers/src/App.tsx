import { UtopiaMap, Layer } from "utopia-ui"
import { events, places } from "./sample-data"

const itemTypeEvent = {
  id: "a6dbf1a7-adf2-4ff5-8e20-d3aad66635fb",
  name: "event",
  show_name_input: false,
  show_profile_button: false,
  show_start_end: false,
  show_start_end_input: false,
  show_text: false,
  show_text_input: false,
  custom_text: "",
  profileTemplate: [],
  offers_and_needs: false,
  icon_as_labels: null,
  relations: false,
  template: "TODO",
  questlog: false,
}

const itemTypePlace = {
  name: "event",
  show_name_input: false,
  show_profile_button: false,
  show_start_end: false,
  show_start_end_input: false,
  show_text: false,
  show_text_input: false,
  custom_text: "",
  profileTemplate: [],
  offers_and_needs: false,
  icon_as_labels: null,
  relations: false,
  template: "TODO",
  questlog: false,
}

function App() {
  return (
    <UtopiaMap center={[50.6, 15.5]} zoom={5} height='100dvh' width="100dvw">
    <Layer
      id="8b6892ea-4ca3-4b86-8060-b0371a8dd375"
      name='events'
      markerIcon={
        {image: "calendar.svg",
         size: 13
        }
      }
      markerShape='square'
      markerDefaultColor='#700'
      data={events}
      menuIcon="calendar"
      menuColor="#700"
      menuText="events"
      itemType={itemTypeEvent}
      />
    <Layer
      id="eea49637-1232-42f9-aec9-77b3187d5d7c"
      name='places'
      markerIcon={
        {image: "point.svg"}
      }
      markerShape='circle'
      markerDefaultColor='#007'
      data={places}
      menuIcon="point"
      menuColor="#007"
      menuText="places"
      itemType={itemTypePlace}
      />
  </UtopiaMap>
  )
}

export default App