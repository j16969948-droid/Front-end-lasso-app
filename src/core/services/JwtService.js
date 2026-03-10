const ID_TOKEN_KEY = "id_token";

/**
 * Obtener token desde localStorage
 */
export const getToken = () => {
  return window.localStorage.getItem(ID_TOKEN_KEY);
};

/**
 * Guardar token en localStorage
 */
export const saveToken = (token) => {
  window.localStorage.setItem(ID_TOKEN_KEY, token);
};

/**
 * Eliminar token de localStorage
 */
export const destroyToken = () => {
  window.localStorage.removeItem(ID_TOKEN_KEY);
};

export default {
  getToken,
  saveToken,
  destroyToken
};