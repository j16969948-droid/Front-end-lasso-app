/**
 * @description get data from localStorage
 */
export const getData = (datakey) => {
  return window.localStorage.getItem(datakey);
};

/**
 * @description save data into localStorage
 */
export const saveData = (datakey, data) => {
  window.localStorage.setItem(datakey, data);
};

/**
 * @description remove data from localStorage
 */
export const destroyData = (datakey) => {
  window.localStorage.removeItem(datakey);
};

export const destroyAllData = () => {
  window.localStorage.clear();
};

export default {
  getData,
  saveData,
  destroyData,
  destroyAllData
};