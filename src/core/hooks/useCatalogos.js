import Api from "../services/ApiService";
import { useQuery } from "@tanstack/react-query";

const getCatalogoServicios = async () => {
  const response = await Api.get("api/v1/catalogoServicios");
  if (!response.ok) {
    throw new Error("Error al obtener el catálogo de servicios");
  }
  console.log(response.json());
  
  return response.json();
};

export const useCatalogoServicios = () => {
  return useQuery({
    queryKey: ["catalogoServicios"],
    queryFn: getCatalogoServicios,
  });
};