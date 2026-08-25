import apiClient from "./axios";

export const registerUserApi = (userData) => {
  return apiClient.post("/auth/register", userData);
};

export const loginUserApi = (credentials) => {
  return apiClient.post("/auth/login", credentials);
};

export const getMeApi = () => {
  return apiClient.get("/auth/me");
};

export const logoutUserApi = () => {
  return apiClient.post("/auth/logout");
};

export const updateProfileApi = (profileData) => {
  return apiClient.patch("/auth/profile", profileData);
};

export const changePasswordApi = (passwordData) => {
  return apiClient.patch("/auth/change-password", passwordData);
};

export const forgotPasswordApi = (email) => {
  return apiClient.post("/auth/forgot-password", { email });
};

export const resetPasswordApi = (token, password) => {
  return apiClient.post(`/auth/reset-password/${token}`, { password });
};

export const verifyEmailApi = (token) => {
  return apiClient.get(`/auth/verify-email/${token}`);
};

export const resendVerificationApi = () => {
  return apiClient.post("/auth/resend-verification");
};
