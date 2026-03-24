import Api from "../services/ApiService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const QUERY_KEY = ["ordenes"];

const getOrdenes = async () => {
    const response = await Api.get("api/v1/ordenes");
    return response.data;
};

export const useOrdenes = () => {
    return useQuery({
        queryKey: QUERY_KEY,
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
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
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

export const useDeleteOrdenes = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const response = await Api.delete(`api/v1/ordenes/${id}`);
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

/**
 * Hook para entregar perfiles automáticamente en una orden
 */
export const useEntregarPerfiles = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const response = await Api.post(`api/v1/ordenes/${id}/entregar-perfiles`);
            return response.data;
        },
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: ["perfilesEntregados", id] });
        },
    });
};

/**
 * Hook para obtener los perfiles entregados de una orden específica
 */
export const usePerfilesEntregados = (ordenId) => {
    return useQuery({
        queryKey: ["perfilesEntregados", ordenId],
        queryFn: async () => {
            if (!ordenId) return [];
            const response = await Api.get(`api/v1/ordenes/${ordenId}/perfiles`);
            return response.data;
        },
        enabled: !!ordenId,
    });
};