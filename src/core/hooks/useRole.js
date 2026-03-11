import DataService from "../services/DataService";

export const getUserRole = () => {
  const user = DataService.getData("user");
  return user?.rol;
};