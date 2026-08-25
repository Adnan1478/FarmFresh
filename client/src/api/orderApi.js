import apiClient from "./axios";

export const createOrderApi = (orderPayload) => {
  return apiClient.post("/orders", orderPayload);
};

export const getMyOrdersApi = () => {
  return apiClient.get("/orders/my-orders");
};

export const getAllOrdersApi = (params) => {
  return apiClient.get("/orders", { params });
};

export const getOrderByIdApi = (id) => {
  return apiClient.get(`/orders/${id}`);
};

export const updateOrderStatusApi = (id, statusData) => {
  return apiClient.patch(`/orders/${id}/status`, statusData);
};

export const cancelOrderApi = (id) => {
  return apiClient.patch(`/orders/${id}/cancel`);
};
