import Api from "../services/ApiService";
import { useQuery } from "@tanstack/react-query";

const getPagosTotales = async (params = {}) => {
    const response = await Api.get("api/v1/pagos/email", { params });
    return response.data;
};

export const usePagosTotales = (filters = {}) => {
    return useQuery({
        queryKey: ["pagosTotales", filters],
        queryFn: () => getPagosTotales(filters),
        refetchInterval: 1000 * 30, 
    });
};