import { useEffect } from 'react'

import { useAuth } from '#components/Auth'

import { useSetPermissionData, useSetPermissionApi, useSetAdminRole } from './hooks/usePermissions'

import type { ItemsApi } from '#types/ItemsApi'
import type { Permission } from '#types/Permission'

/**
 * @category Map
 */
export function Permissions({
  data,
  api,
  adminRole,
}: {
  data?: Permission[]
  api?: ItemsApi<Permission>
  adminRole?: string
}) {
  const setPermissionData = useSetPermissionData()
  const setPermissionApi = useSetPermissionApi()
  const setAdminRole = useSetAdminRole()
  const { user } = useAuth()

  useEffect(() => {
    adminRole && setAdminRole(adminRole)
    data && setPermissionData(data)
    api && setPermissionApi(api)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, data, adminRole, user])

  return <></>
}
