import apiClient from "./axios";

export const validateCouponApi = (code, subtotal) =>
  apiClient.post("/coupons/validate", { code, subtotal });

export const createCouponApi = (couponData) => apiClient.post("/coupons", couponData);
export const getAllCouponsApi = () => apiClient.get("/coupons");
export const updateCouponApi = (id, data) => apiClient.put(`/coupons/${id}`, data);
export const deleteCouponApi = (id) => apiClient.delete(`/coupons/${id}`);
