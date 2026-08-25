import apiClient from "./axios";

export const getVendorDashboardApi = () => apiClient.get("/vendor/dashboard");
export const submitHarvestBatchApi = (batchData) => apiClient.post("/vendor/supplies", batchData);
export const getVendorSuppliesApi = () => apiClient.get("/vendor/supplies");
export const updateSupplyStatusApi = (id, data) => apiClient.patch(`/vendor/supplies/${id}/status`, data);
