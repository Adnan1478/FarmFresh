import apiClient from "./axios";

export const createReviewApi = (reviewData) => {
  return apiClient.post("/reviews", reviewData);
};

export const getProductReviewsApi = (productId) => {
  return apiClient.get(`/reviews/product/${productId}`);
};

export const getAllReviewsAdminApi = (params) => {
  return apiClient.get("/reviews/admin", { params });
};

export const updateReviewStatusApi = (id, status) => {
  return apiClient.patch(`/reviews/${id}/status`, { status });
};

export const replyToReviewApi = (id, adminReply) => {
  return apiClient.patch(`/reviews/${id}/reply`, { adminReply });
};

export const deleteReviewApi = (reviewId) => {
  return apiClient.delete(`/reviews/${reviewId}`);
};
