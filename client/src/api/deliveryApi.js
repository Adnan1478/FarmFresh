import apiClient from "./axios";

export const getAssignedDeliveryOrdersApi = () => apiClient.get("/orders/delivery/assigned");
export const assignDeliveryBoyApi = (orderId, deliveryBoyId) =>
  apiClient.patch(`/orders/${orderId}/assign-delivery`, { deliveryBoyId });
export const updateDeliveryStatusApi = (orderId, data) =>
  apiClient.patch(`/orders/${orderId}/delivery-status`, data);
