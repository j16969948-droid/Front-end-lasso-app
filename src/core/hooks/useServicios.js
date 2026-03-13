import Api from "../services/ApiService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const getServicios = async () => {
  const response = await Api.get("api/v1/servicios");
  console.log(response.data);
  return response.data;
};

export const useServicios = () => {
  return useQuery({
    queryKey: ["servicios"],
    queryFn: getServicios,
  });
};

export const useCreateServicio = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const response = await Api.post("api/v1/servicios", data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servicios"] });
    },
  });
};

export const useUpdateServicio = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => Api.patch(`api/v1/servicios/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servicios"] });
    },
  });
};

export const useDeleteServicio = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => Api.delete(`api/v1/servicios/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servicios"] });
    },
  });
};
