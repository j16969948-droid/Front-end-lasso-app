import Api from "../services/ApiService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const getOrdenes = async () => {
    const response = await Api.get("api/v1/ordenes");
    console.log(response.data);
    return response.data;
};

export const useOrdenes = () => {
    return useQuery({
        queryKey: ["ordenes"],
        queryFn: getOrdenes,
    });
};

export const useCreateOrdenes = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data) => {
            const response = await Api.post("api/v1/ordenes", data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ordenes"] });
        },
    });
};

export const useUpdateOrdenes = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }) => {
            const response = await Api.put(`api/v1/ordenes/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ordenes"] });
        },
    });
};

export const useDeleteOrdenes = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const response = await Api.delete(`api/v1/ordenes/${id}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ordenes"] });
        },
    });
};