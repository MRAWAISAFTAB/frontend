import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api", // your backend
  withCredentials: true, // VERY IMPORTANT (for cookies)
});

export default axiosInstance;