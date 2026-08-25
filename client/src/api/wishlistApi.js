import apiClient from "./axios";

export const getWishlistApi = () => {
  return apiClient.get("/wishlist");
};

export const toggleWishlistApi = (productId) => {
  return apiClient.post("/wishlist/toggle", { productId });
};
