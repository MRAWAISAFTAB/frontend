import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL, // your backend
  withCredentials: true, // VERY IMPORTANT (for cookies)
});

export default axiosInstance;