import apiClient from "./axios";

// Categories API
export const getCategoriesApi = () => {
  return apiClient.get("/categories");
};

export const createCategoryApi = (categoryData) => {
  return apiClient.post("/categories", categoryData);
};

export const updateCategoryApi = (id, categoryData) => {
  return apiClient.put(`/categories/${id}`, categoryData);
};

export const deleteCategoryApi = (id) => {
  return apiClient.delete(`/categories/${id}`);
};

// Products API
export const getProductsApi = (params) => {
  return apiClient.get("/products", { params });
};

export const getProductByIdApi = (id) => {
  return apiClient.get(`/products/${id}`);
};

export const createProductApi = (productData) => {
  return apiClient.post("/products", productData);
};

export const updateProductApi = (id, productData) => {
  return apiClient.put(`/products/${id}`, productData);
};

export const deleteProductApi = (id) => {
  return apiClient.delete(`/products/${id}`);
};
