import {
  TextView as PlainTextView,
  StartEndView as PlainStartEndView,
  PopupTextInput as PlainPopupTextInput,
  PopupButton as PlainPopupButton,
  PopupCheckboxInput as PlainPopupCheckboxInput,
  PopupTextAreaInput as PlainPopupTextAreaInput,
  PopupStartEndInput as PlainPopupStartEndInput,
  TextPreview as PlainTextPreview,
} from '#components/Map/Subcomponents/ItemPopupComponents'

import { templateify } from './templateify'

export { PopupForm } from './PopupForm'
export { PopupView } from './PopupView'

export const TextView = templateify(PlainTextView)
export const TextPreview = templateify(PlainTextPreview)
export const StartEndView = templateify(PlainStartEndView)
export const PopupTextInput = templateify(PlainPopupTextInput)
export const PopupButton = templateify(PlainPopupButton)
export const PopupCheckboxInput = templateify(PlainPopupCheckboxInput)
export const PopupTextAreaInput = templateify(PlainPopupTextAreaInput)
export const PopupStartEndInput = templateify(PlainPopupStartEndInput)
