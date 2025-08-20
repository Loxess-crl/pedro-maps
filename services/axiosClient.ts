import axios from "axios";
import SecureStoreService from "./secureStoreService";

const baseURL = "https://0cdc3a91d2ba.ngrok-free.app/api";
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

export default axiosClient;

export const axiosClientWithoutToken = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});
