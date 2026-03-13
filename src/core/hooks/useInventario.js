import Api from "../services/ApiService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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

export const useCreateInventario = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data) => {
            const response = await Api.post("api/v1/inventario", data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["inventario"] });
        },
    });
};

export const useUpdateInventario = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }) => {
            const response = await Api.put(`api/v1/inventario/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["inventario"] });
        },
    });
};

export const useDeleteInventario = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const response = await Api.delete(`api/v1/inventario/${id}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["inventario"] });
        },
    });
};