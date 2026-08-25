import apiClient from "./axios";

export const uploadImageApi = (formData) => {
  return apiClient.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
};
