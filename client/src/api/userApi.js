import apiClient from "./axios";

export const getUsersApi = (params) => {
  return apiClient.get("/users", { params });
};

export const getUserByIdApi = (id) => {
  return apiClient.get(`/users/${id}`);
};

export const updateUserStatusApi = (id, isActive) => {
  return apiClient.patch(`/users/${id}/status`, { isActive });
};

export const updateUserRoleApi = (id, role) => {
  return apiClient.patch(`/users/${id}/role`, { role });
};

export const deleteUserApi = (id) => {
  return apiClient.delete(`/users/${id}`);
};
