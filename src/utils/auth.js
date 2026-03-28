import DataService from '../core/services/DataService'

export const getToken = () => {
  return DataService.getData('token')
}

export const getUser = () => {
  return DataService.getData('user')
}

export const isAuthenticated = () => {
  return !!getToken()
}

export const hasRole = (roleName) => {
  const user = getUser()

  if (!user) return false

  if (user.rol === roleName) return true

  if (Array.isArray(user.roles)) {
    return user.roles.some((r) =>
      typeof r === 'string' ? r === roleName : r?.nombre === roleName
    )
  }

  return false
}