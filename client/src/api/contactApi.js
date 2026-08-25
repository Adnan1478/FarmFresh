import apiClient from "./axios";

export const sendContactMessageApi = (contactData) => {
  return apiClient.post("/contact", contactData);
};

export const getAllContactMessagesApi = (params) => {
  return apiClient.get("/contact", { params });
};

export const updateContactStatusApi = (id, status) => {
  return apiClient.patch(`/contact/${id}/status`, { status });
};

export const deleteContactMessageApi = (id) => {
  return apiClient.delete(`/contact/${id}`);
};
