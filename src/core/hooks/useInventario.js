import Api from "../services/ApiService";
import { useQuery } from "@tanstack/react-query";

const getInventario = async () => {
    const response = await Api.get("api/v1/inventario");
    console.log(response.data);
    return response.data;
};

export const useInventario = () => {
    return useQuery({
        queryKey: ["inventario"],
        queryFn: getInventario,
    });
};