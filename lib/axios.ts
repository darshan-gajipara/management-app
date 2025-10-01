import axios from "axios";

const AxiosApi = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_BASE_URL,
});

AxiosApi.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export default AxiosApi;