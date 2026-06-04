import { AttestationsView } from '#components/Profile/Subcomponents/AttestationsView'
import { ContactInfoForm } from '#components/Profile/Subcomponents/ContactInfoForm'
import { ContactInfoView } from '#components/Profile/Subcomponents/ContactInfoView'
import { CrowdfundingForm } from '#components/Profile/Subcomponents/CrowdfundingForm'
import { CrowdfundingView } from '#components/Profile/Subcomponents/CrowdfundingView'
import { GalleryForm } from '#components/Profile/Subcomponents/GalleryForm'
import { GalleryView } from '#components/Profile/Subcomponents/GalleryView'
import { GroupSubheaderForm } from '#components/Profile/Subcomponents/GroupSubheaderForm'
import { GroupSubHeaderView } from '#components/Profile/Subcomponents/GroupSubHeaderView'
import { InviteLinkView } from '#components/Profile/Subcomponents/InviteLinkView'
import { ProfileStartEndForm } from '#components/Profile/Subcomponents/ProfileStartEndForm'
import { ProfileStartEndView } from '#components/Profile/Subcomponents/ProfileStartEndView'
import { ProfileTagsForm } from '#components/Profile/Subcomponents/ProfileTagsForm'
import { ProfileTagsView } from '#components/Profile/Subcomponents/ProfileTagsView'
import { ProfileTextForm } from '#components/Profile/Subcomponents/ProfileTextForm'
import { ProfileTextView } from '#components/Profile/Subcomponents/ProfileTextView'
import { RelationsView } from '#components/Profile/Subcomponents/RelationsView'
import { TabsContainerForm } from '#components/Profile/Subcomponents/TabsContainerForm'
import { TabsContainerView } from '#components/Profile/Subcomponents/TabsContainerView'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ComponentMap = Record<string, React.ComponentType<any>>

/**
 * Component map for view mode (ProfileView, TabsContainerView)
 * Maps collection names from the external data schema to React components
 */
export const viewComponentMap: ComponentMap = {
  groupSubheaders: GroupSubHeaderView,
  texts: ProfileTextView,
  contactInfos: ContactInfoView,
  startEnd: ProfileStartEndView,
  gallery: GalleryView,
  crowdfundings: CrowdfundingView,
  inviteLinks: InviteLinkView,
  relations: RelationsView,
  tabs: TabsContainerView,
  // eslint-disable-next-line camelcase -- Keys match external data schema
  tags_component: ProfileTagsView,
  // eslint-disable-next-line camelcase -- Keys match external data schema
  attestations_component: AttestationsView,
}

/**
 * Component map for form/edit mode (ProfileForm, TabsContainerForm)
 * Maps collection names from the external data schema to React components
 * Some components return null as they are view-only or not editable
 */
export const formComponentMap: ComponentMap = {
  groupSubheaders: GroupSubheaderForm,
  texts: ProfileTextForm,
  contactInfos: ContactInfoForm,
  startEnd: ProfileStartEndForm,
  crowdfundings: CrowdfundingForm,
  gallery: GalleryForm,
  inviteLinks: () => null,
  relations: () => null, // Relations are not editable in form
  tabs: TabsContainerForm,
  // eslint-disable-next-line camelcase -- Keys match external data schema
  tags_component: ProfileTagsForm,
  // eslint-disable-next-line camelcase -- Keys match external data schema
  attestations_component: () => null, // Attestations are view-only
}
