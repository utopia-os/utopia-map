import { MapIcon } from '@heroicons/react/24/outline'
import { SVG } from 'utopia-ui'

export const routes = [
  {
    path: '/',
    icon: <MapIcon style={{ width: 24 }} />,
    name: 'Map',
  } /**
  {
    path: '/people', // url
    icon: <UsersIcon style={{width: 24 }}/>, // icon component
    name: 'People', // name that appear in Sidebar
  }, */,

  /*
  {
    path: '', //no url needed as this has submenu
    icon: <DocumentDuplicateIcon className={`${iconClasses} inline` }/>, // icon component
    name: 'Pages', // name that appear in Sidebar
    submenu : [
      {
        path: '/login',
        icon: <ArrowRightOnRectangleIcon className={submenuIconClasses}/>,
        name: 'Kanban',
      },
      {
        path: '/register', //url
        icon: <UserIcon className={submenuIconClasses}/>, // icon component
        name: 'Gitlab', // name that appear in Sidebar
      },
      {
        path: '/forgot-password',
        icon: <KeyIcon className={submenuIconClasses}/>,
        name: 'Wiki',
      },
    ]
  }
  */
]

export const getBottomRoutes = (currentUrl: string) => {
  const url = new URL(currentUrl)
  const isEmbedded = url.searchParams.get('embedded') === 'true'

  const bottomRoutes = [
    // Other routes can be added here
  ]

  if (!isEmbedded) {
    bottomRoutes.push(
      {
        path: 'https://github.com/utopia-os/utopia-ui', // url
        icon: <SVG src='github.svg' className='w-6 h-6' />,
        name: 'GitHub', // name that appear in Sidebar
        blank: true,
      },
      {
        path: 'https://opencollective.com/utopia-project', // url
        icon: <SVG src='opencollective.svg' className='w-6 h-6' />,
        name: 'Open Collective', // name that appear in Sidebar
        blank: true,
      },
    )
  }

  return bottomRoutes
}
