/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { useCallback, useReducer, createContext, useContext, useState } from 'react'

import { useAuth } from '#components/Auth/useAuth'

import type { Item } from '#types/Item'
import type { ItemsApi } from '#types/ItemsApi'
import type { LayerProps } from '#types/LayerProps'
import type { Permission } from '#types/Permission'
import type { PermissionAction } from '#types/PermissionAction'
import type { PermissionCondition } from '#types/PermissionCondition'

type ActionType = { type: 'ADD'; permission: Permission } | { type: 'REMOVE'; id: string }

type UsePermissionManagerResult = ReturnType<typeof usePermissionsManager>

const PermissionContext = createContext<UsePermissionManagerResult>({
  permissions: [],
  setPermissionApi: () => {},
  setPermissionData: () => {},
  setAdminRole: () => {},
  hasUserPermission: () => true,
})

function usePermissionsManager(initialPermissions: Permission[]): {
  permissions: Permission[]
  setPermissionApi: (api: ItemsApi<Permission>) => void
  setPermissionData: (data: Permission[]) => void
  setAdminRole: (adminRole: string) => void
  hasUserPermission: (
    collectionName: string,
    action: PermissionAction,
    item?: Item,
    layer?: LayerProps,
  ) => boolean
} {
  const [permissions, dispatch] = useReducer((state: Permission[], action: ActionType) => {
    switch (action.type) {
      case 'ADD':
        // eslint-disable-next-line no-case-declarations
        const exist = state.find((permission) => permission.id === action.permission.id)
        if (!exist) {
          return [...state, action.permission]
        } else return state

      case 'REMOVE':
        return state.filter(({ id }) => id !== action.id)
      default:
        throw new Error()
    }
  }, initialPermissions)

  const [adminRole, setAdminRole] = useState<string | null>(null)
  const { user } = useAuth()

  const setPermissionApi = useCallback(async (api: ItemsApi<Permission>) => {
    const result = await api.getItems()
    result.map((permission) => {
      dispatch({ type: 'ADD', permission })
      return null
    })
  }, [])

  const setPermissionData = useCallback((data: Permission[]) => {
    data.map((permission) => {
      dispatch({ type: 'ADD', permission })
      return null
    })
  }, [])

  const hasUserPermission = useCallback(
    (collectionName: string, action: PermissionAction, item?: Item, layer?: LayerProps) => {
      const evaluateCondition = (condition: PermissionCondition) => {
        if (condition.user_created?._eq === '$CURRENT_USER') {
          return item?.user_created?.id === user?.id
        }
        if (condition.public_edit?._eq === true) {
          return item?.public_edit === true
        }
        return false
      }

      const evaluatePermissions = (permissionConditions: Permission['permissions']) => {
        if (!permissionConditions?._and) {
          return true
        }

        return permissionConditions._and.every((andCondition: PermissionCondition) =>
          (andCondition as any)._or
            ? (andCondition as any)._or.some((orCondition: PermissionCondition) =>
                evaluateCondition(orCondition),
              )
            : evaluateCondition(andCondition),
        )
      }
      if (collectionName === 'items' && action === 'create' && layer?.public_edit_items) return true
      // Bedingung für leere Berechtigungen nur, wenn NICHT item und create
      if (permissions.length === 0) return true
      else if (user && user.role?.id === adminRole) return true
      else {
        return permissions.some(
          (p) =>
            p.action === action &&
            p.collection === collectionName &&
            ((p.policy?.name === user?.role?.name &&
              (!item || evaluatePermissions(p.permissions))) ||
              (p.policy?.name === '$t:public_label' &&
                (layer?.public_edit_items || item?.layer?.public_edit_items) &&
                (!item || evaluatePermissions(p.permissions)))),
        )
      }
    },
    [permissions, user, adminRole],
  )

  return { permissions, setPermissionApi, setPermissionData, setAdminRole, hasUserPermission }
}

export const PermissionsProvider: React.FunctionComponent<{
  initialPermissions: Permission[]
  children?: React.ReactNode
}> = ({
  initialPermissions,
  children,
}: {
  initialPermissions: Permission[]
  children?: React.ReactNode
}) => (
  <PermissionContext.Provider value={usePermissionsManager(initialPermissions)}>
    {children}
  </PermissionContext.Provider>
)

export const usePermissions = (): Permission[] => {
  const { permissions } = useContext(PermissionContext)
  return permissions
}

export const useSetPermissionApi = (): UsePermissionManagerResult['setPermissionApi'] => {
  const { setPermissionApi } = useContext(PermissionContext)
  return setPermissionApi
}

export const useSetPermissionData = (): UsePermissionManagerResult['setPermissionData'] => {
  const { setPermissionData } = useContext(PermissionContext)
  return setPermissionData
}

export const useHasUserPermission = (): UsePermissionManagerResult['hasUserPermission'] => {
  const { hasUserPermission } = useContext(PermissionContext)
  return hasUserPermission
}

export const useSetAdminRole = (): UsePermissionManagerResult['setAdminRole'] => {
  const { setAdminRole } = useContext(PermissionContext)
  return setAdminRole
}
