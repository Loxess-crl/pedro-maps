import axios from "axios";
import SecureStoreService from "./secureStoreService";

let showErrorCallback: (() => void) | null = null;

export function setErrorHandler(callback: () => void) {
  showErrorCallback = callback;
}

const baseURL = "https://a1a0a3e76eb9.ngrok-free.app/api";
const axiosClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "pedromaps",
  },
});

axiosClient.interceptors.request.use(async (config) => {
  const token = await SecureStoreService.getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (res) => res,
  (err) => {
    console.log("Axios error:", err);
    console.log("Axios error response:", showErrorCallback);
    if (err.response?.status === 401 && showErrorCallback) {
      showErrorCallback();
    }
    return Promise.reject(err);
  }
);

export default axiosClient;

export const axiosClientWithoutToken = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});
