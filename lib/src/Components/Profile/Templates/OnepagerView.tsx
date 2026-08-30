/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { TextView } from '#components/Map/Subcomponents/ItemPopupComponents'
import { ContactInfoView } from '#components/Profile/Subcomponents/ContactInfoView'
import { GroupSubHeaderView } from '#components/Profile/Subcomponents/GroupSubHeaderView'

import type { Item } from '#types/Item'

export const OnepagerView = ({ item }: { item: Item }) => {
  return (
    <div className='tw:h-full tw:overflow-y-auto fade'>
      <GroupSubHeaderView
        item={item}
        shareBaseUrl={`https://www.wuerdekompass.org/aktivitaeten/gruppensuche/#/gruppe/${item.slug}`}
      />
      {item.user_created?.first_name && <ContactInfoView heading='Du hast Fragen?' item={item} />}
      {/* Description Section */}
      <div className='tw:my-10 tw:mt-2 tw:px-6 tw:text-sm '>
        <TextView rawText={item.text ?? 'Keine Beschreibung vorhanden'} />
      </div>
      {/* Next Appointment Section */}
      {item.next_appointment && (
        <div className='tw:my-10 tw:px-6'>
          <h2 className='tw:text-lg tw:font-semibold'>Nächste Termine</h2>
          <div className='tw:mt-2 tw:text-sm'>
            <TextView rawText={item.next_appointment} />
          </div>
        </div>
      )}
      ;{/* Relations Section */}
      {/* {d.relations && ( */}
      {/*    <div className="tw:my-10 tw:px-6"> */}
      {/*        <h2 className="tw:text-lg tw:font-semibold tw:mb-4">Projekte</h2> */}
      {/*        {d.relations.map((project, index) => ( */}
      {/*            <RelationCard */}
      {/*                key={index} */}
      {/*                title={project.title} */}
      {/*                description={project.description} */}
      {/*                imageSrc={project.imageSrc} */}
      {/*            /> */}
      {/*        ))} */}
      {/*    </div> */}
      {/* )} */}
    </div>
  )
}
