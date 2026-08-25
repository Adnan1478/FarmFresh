import apiClient from "./axios";

// Inventory Summary Metrics
export const getInventorySummaryApi = () => apiClient.get("/inventory/summary");
export const getLowStockAlertsApi = () => apiClient.get("/inventory/low-stock");
export const getExpiringBatchesApi = () => apiClient.get("/inventory/expiring-batches");
export const getStockMovementsApi = (params) => apiClient.get("/inventory/movements", { params });

// Batches API
export const createBatchApi = (batchData) => apiClient.post("/batches", batchData);
export const getAllBatchesApi = (params) => apiClient.get("/batches", { params });
export const deleteBatchApi = (id) => apiClient.delete(`/batches/${id}`);

// Waste Management API
export const recordWasteApi = (wasteData) => apiClient.post("/waste", wasteData);
export const getAllWasteRecordsApi = () => apiClient.get("/waste");

// Suppliers API
export const createSupplierApi = (supplierData) => apiClient.post("/suppliers", supplierData);
export const getAllSuppliersApi = () => apiClient.get("/suppliers");
export const deleteSupplierApi = (id) => apiClient.delete(`/suppliers/${id}`);

// Purchase Orders API
export const createPurchaseOrderApi = (poData) => apiClient.post("/purchase-orders", poData);
export const getAllPurchaseOrdersApi = () => apiClient.get("/purchase-orders");
export const receivePurchaseOrderApi = (id) => apiClient.patch(`/purchase-orders/${id}/receive`);
