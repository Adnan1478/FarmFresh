import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

// Request Interceptor: Attach Auth Token if present
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Normalize Errors cleanly
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = {
      success: false,
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Connection error. Please check your internet connection.",
      code: error.response?.data?.code || "SERVER_ERROR"
    };

    if (error.response?.status === 401) {
      customError.message = error.response?.data?.message || "Session expired. Please sign in again.";
    } else if (error.response?.status === 403) {
      customError.message = "You do not have permission to access this resource.";
    }

    return Promise.reject(customError);
  }
);

export default apiClient;
