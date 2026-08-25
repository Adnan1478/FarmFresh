import apiClient from "./axios";

export const getCartApi = () => {
  return apiClient.get("/cart");
};

export const addToCartApi = (productId, quantity = 1) => {
  return apiClient.post("/cart", { productId, quantity });
};

export const updateCartItemApi = (productId, quantity) => {
  return apiClient.put(`/cart/${productId}`, { quantity });
};

export const removeFromCartApi = (productId) => {
  return apiClient.delete(`/cart/${productId}`);
};

export const clearCartApi = () => {
  return apiClient.delete("/cart");
};
