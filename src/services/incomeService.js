import axiosInstance from "../utils/axiosInstance";

export const getAllIncome = () =>
  axiosInstance.get("/income/get");

export const addIncome = (data) =>
  axiosInstance.post("/income/add", data);

export const deleteIncome = (id) =>
  axiosInstance.delete(`/income/${id}`);

export const downloadIncomeExcel = () =>
  axiosInstance.get("/income/downloadexcel", { responseType: "blob" });