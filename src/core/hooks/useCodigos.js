import Api from "../services/ApiService";
import { useMutation, useQuery } from "@tanstack/react-query";

const fetchCodigos = async (filters = {}) => {
    const response = await Api.get("api/v1/codigos-acceso", { params: filters });
    return response.data;
};
const actualizarPlataforma = async (plataforma) => {
    const response = await Api.post(`api/v1/codigos-acceso/actualizar`, { plataforma });
    return response.data;
};

export const useCodigosQuery = (filters = {}) => {
    return useQuery({
        queryKey: ["codigos-acceso", filters],
        queryFn: () => fetchCodigos(filters),
    });
};

export const useCodigos = () => {
    return useMutation({
        mutationFn: validarComprobante,
    });
};

export const useActualizarPlataforma = () => {
    return useMutation({
        mutationFn: actualizarPlataforma,
    });
};
