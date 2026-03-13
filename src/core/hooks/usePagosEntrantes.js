import Api from "../services/ApiService";
import { useQuery } from "@tanstack/react-query";

const getPagosEntrantes = async () => {
    const response = await Api.get("api/v1/pagos/entrantes");
    console.log(response.data);
    return response.data;
};

export const usePagosEntrantes = () => {
    return useQuery({
        queryKey: ["pagosEntrantes"],
        queryFn: getPagosEntrantes,
    });
};