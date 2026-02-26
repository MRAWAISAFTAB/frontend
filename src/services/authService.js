import axiosInstance from "../utils/axiosInstance";

export const loginUser = (email, password) =>
  axiosInstance.post("/api/login", { email, password });

export const registerUser = (fullName, email, password, profileImageUrl) =>
  axiosInstance.post("/api/register", { fullName, email, password, profileImageUrl });

export const logoutUser = () =>
  axiosInstance.post("/api/logout");

export const uploadProfileImage = (file) => {
  const formData = new FormData();
  formData.append("image", file);
  return axiosInstance.post("/api/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};