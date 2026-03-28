import Api from "../services/ApiService";
import { useMutation, useQuery } from "@tanstack/react-query";

// ─── Fetchers ────────────────────────────────────────────────────────────────

/**
 * Obtiene todos los códigos de acceso con filtros opcionales.
 * GET api/v1/codigos-acceso
 */
const fetchCodigos = async (filters = {}) => {
    const response = await Api.get("api/v1/codigos-acceso", { params: filters });
    return response.data;
};

/**
 * Solicita la sincronización/actualización de códigos de una plataforma.
 * POST api/v1/codigos-acceso/actualizar
 * @param {string} plataforma - Nombre de la plataforma (ej: 'netflix', 'disney')
 */
const actualizarPlataforma = async (plataforma) => {
    const response = await Api.post("api/v1/codigos-acceso/actualizar", { plataforma });
    return response.data;
};

// ─── Hooks ───────────────────────────────────────────────────────────────────

/**
 * Hook para listar códigos de acceso con filtros.
 * Uso: const { data, isLoading } = useCodigosQuery({ correo: 'x@x.com' })
 */
export const useCodigosQuery = (filters = {}) => {
    return useQuery({
        queryKey: ["codigos-acceso", filters],
        queryFn: () => fetchCodigos(filters),
    });
};

/**
 * Hook para sincronizar/actualizar códigos de una plataforma.
 * Uso: const { mutate } = useActualizarPlataforma()
 *
 * NOTA: Para validar comprobantes de pago usar `useValidarComprobante`
 * de ./useValidarComprobante.js  — son funcionalidades distintas.
 */
export const useActualizarPlataforma = () => {
    return useMutation({
        mutationFn: actualizarPlataforma,
    });
};
