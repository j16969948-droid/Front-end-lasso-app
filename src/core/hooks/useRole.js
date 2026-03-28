import DataService from "../services/DataService";

/**
 * Obtiene el rol principal del usuario.
 * Compatible con dos formatos de respuesta del backend:
 *   - user.rol  → string directo (formato antiguo)
 *   - user.roles → arreglo de objetos { nombre, ... } (formato actual)
 */
export const getUserRole = () => {
  const user = DataService.getData("user");
  if (!user) return null;

  // Prioridad 1: campo escalar `rol`
  if (user.rol) return user.rol;

  // Prioridad 2: primer elemento del arreglo `roles`
  if (Array.isArray(user.roles) && user.roles.length > 0) {
    const first = user.roles[0];
    return typeof first === 'string' ? first : (first?.nombre ?? null);
  }

  return null;
};

/**
 * Verifica si el usuario tiene un rol específico.
 * Busca tanto en `user.rol` como en `user.roles[]`.
 */
export const hasRole = (roleName) => {
  const user = DataService.getData("user");
  if (!user) return false;

  if (user.rol === roleName) return true;

  if (Array.isArray(user.roles)) {
    return user.roles.some((r) =>
      typeof r === 'string' ? r === roleName : r?.nombre === roleName
    );
  }

  return false;
};