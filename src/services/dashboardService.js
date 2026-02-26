import axiosInstance from "../utils/axiosInstance";

export const getDashboardData = () =>
  axiosInstance.get("/dashboard");