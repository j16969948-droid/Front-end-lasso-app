import Api from "../services/ApiService";
import { useQuery } from "@tanstack/react-query";

const getCatalogoServicios = async () => {
  const response = await Api.get("api/v1/catalogoServicios");
  console.log(response.data);
  return response.data;
};

export const useCatalogoServicios = () => {
  return useQuery({
    queryKey: ["catalogoServicios"],
    queryFn: getCatalogoServicios,
  });
};