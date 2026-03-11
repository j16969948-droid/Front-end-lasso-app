const ID_TOKEN_KEY = "token";

/**
 * Obtener token desde localStorage
 */
export const getToken = () => {
  const token = localStorage.getItem("token");
  return token ? JSON.parse(token) : null;
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