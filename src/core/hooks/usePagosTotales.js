import Api from "../services/ApiService";
import { useQuery } from "@tanstack/react-query";

const getPagosTotales = async () => {
    const response = await Api.get("api/v1/pagos/email");
    console.log(response.data);
    return response.data;
};

export const usePagosTotales = () => {
    return useQuery({
        queryKey: ["pagosTotales"],
        queryFn: getPagosTotales,
    });
};