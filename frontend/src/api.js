import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" && window.location.port === "5000" ? "/api" : "http://localhost:5000/api");

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("hotelpro_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
