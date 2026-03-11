import Api from "../services/ApiService";
import { useMutation } from "@tanstack/react-query";
import DataService from "../services/DataService";


const loginUser = async (data) => {
  const response = await Api.post("api/v1/auth/login", {
    telefono: data.telefono,
    password: data.password,
  });

  return response.data;
};

export const useLogin = () => {
  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      DataService.saveData('token', data.token)
      DataService.saveData('user', data.user)
    },
    onError: (error) => {
      alert("Error en login");
    },
  });
};