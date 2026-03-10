import axios from "axios";
import JwtService from "./JwtService";

const Api = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL,
    headers: {
        Authorization: `Bearer ${JwtService.getToken()}`
    }
});

Api.interceptors.request.use(
    function (config) {
        const token = JwtService.getToken();

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);

export default Api;