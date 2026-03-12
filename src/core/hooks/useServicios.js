import Api from "../services/ApiService";
import { useQuery } from "@tanstack/react-query";

const getServicios = async () => {
  const response = await Api.get("api/v1/servicios");
  console.log(response.data);
  return response.data;
};

export const useServicios = () => {
  return useQuery({
    queryKey: ["servicios"],
    queryFn: getServicios,
  });
};