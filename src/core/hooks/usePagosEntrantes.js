import Api from "../services/ApiService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const getPagosEntrantes = async (params = {}) => {
    const response = await Api.get("api/v1/pagos-entrantes", { params });
    return response.data;
};

export const usePagosEntrantes = (filters = {}) => {
    return useQuery({
        queryKey: ["pagosEntrantes", filters],
        queryFn: () => getPagosEntrantes(filters),
        staleTime: 1000 * 30,
    });
};

export const useValidarPagoManual = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const response = await Api.patch(`api/v1/pagos-entrantes/${id}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pagosEntrantes"] });
        },
        onError: (error) => {
            console.error("Error al validar el pago:", error);
        },
    });
};