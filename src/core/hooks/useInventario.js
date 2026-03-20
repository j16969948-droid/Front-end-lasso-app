import Api from "../services/ApiService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const QUERY_KEY = ["inventario"];

const getInventario = async () => {
    const response = await Api.get("api/v1/inventario");
    return response.data;
};

export const useInventario = () => {
    return useQuery({
        queryKey: QUERY_KEY,
        queryFn: getInventario,
        staleTime: 1000 * 30,
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
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
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
        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: QUERY_KEY });
            const previousData = queryClient.getQueryData(QUERY_KEY);

            queryClient.setQueryData(QUERY_KEY, (old) => {
                if (!Array.isArray(old)) return old;
                return old.map((item) =>
                    item.id === id ? { ...item, ...data } : item
                );
            });

            return { previousData };
        },
        onError: (_err, _vars, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(QUERY_KEY, context.previousData);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
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
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: QUERY_KEY });
            const previousData = queryClient.getQueryData(QUERY_KEY);

            queryClient.setQueryData(QUERY_KEY, (old) => {
                if (!Array.isArray(old)) return old;
                return old.filter((item) => item.id !== id);
            });

            return { previousData };
        },
        onError: (_err, _vars, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(QUERY_KEY, context.previousData);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        },
    });
};