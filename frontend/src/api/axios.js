import axios from "axios";

const isLocalDevelopment = ["localhost", "127.0.0.1"].includes(window.location.hostname);

const API = axios.create({
  // Local UI development should call the local FastAPI server through Vite's
  // proxy, even if a developer's ignored .env still contains the production URL.
  baseURL: isLocalDevelopment ? "" : import.meta.env.VITE_API_URL,
  timeout: 20000,
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
