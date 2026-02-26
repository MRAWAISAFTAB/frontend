import axiosInstance from "../utils/axiosInstance";

export const getAllExpense = () =>
  axiosInstance.get("/expense/get");

export const addExpense = (data) =>
  axiosInstance.post("/expense/add", data);

export const deleteExpense = (id) =>
  axiosInstance.delete(`/expense/${id}`);

export const downloadExpenseExcel = () =>
  axiosInstance.get("/expense/downloadexcel", { responseType: "blob" });