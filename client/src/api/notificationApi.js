import apiClient from "./axios";

export const getUserNotificationsApi = () => apiClient.get("/notifications");
export const markNotificationReadApi = (id) => apiClient.patch(`/notifications/${id}/read`);
export const markAllNotificationsReadApi = () => apiClient.patch("/notifications/read-all");
export const deleteNotificationApi = (id) => apiClient.delete(`/notifications/${id}`);
