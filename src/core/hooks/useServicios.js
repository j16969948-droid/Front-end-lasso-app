import Api from "../services/ApiService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const QUERY_KEY = ["servicios"];

const getServicios = async () => {
  const response = await Api.get("api/v1/servicios");
  return response.data;
};

export const useServicios = () => {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: getServicios,
  });
};

export const useCreateServicio = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const response = await Api.post("api/v1/servicios", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
};

export const useUpdateServicio = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => Api.patch(`api/v1/servicios/${id}`, data),
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

export const useDeleteServicio = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => Api.delete(`api/v1/servicios/${id}`),
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
 * Hook para obtener el resumen de stock disponible por servicio
 */
export const useInventarioDisponible = () => {
  return useQuery({
    queryKey: ["inventarioDisponible"],
    queryFn: async () => {
      const response = await Api.get("api/v1/servicios/inventario-disponible");
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

