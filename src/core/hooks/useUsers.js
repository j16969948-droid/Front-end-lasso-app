import Api from "../services/ApiService";
import { useQuery } from "@tanstack/react-query";

const QUERY_KEY = ["usuarios"];

/**
 * Hook to fetch users with optional role filtering
 * @param {Object} filters - { roles: [id1, id2] }
 */
export const useUsers = (filters = {}) => {
    return useQuery({
        queryKey: [...QUERY_KEY, filters],
        queryFn: async () => {
            const response = await Api.get("api/v1/usuarios", { params: filters });
            return response.data;
        },
    });
};
