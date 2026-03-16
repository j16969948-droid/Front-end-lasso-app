import Api from "../services/ApiService";
import { useMutation } from "@tanstack/react-query";

const validarComprobante = async (url) => {
    const response = await Api.post("api/v1/validar-comprobante", { url });
    return response.data;
};

export const useValidarComprobante = () => {
    return useMutation({
        mutationFn: validarComprobante,
    });
};
