import apiClient from "./axios";

export const createRazorpayOrderApi = (amount) =>
  apiClient.post("/payment/razorpay/create-order", { amount });

export const verifyRazorpayPaymentApi = (verificationData) =>
  apiClient.post("/payment/razorpay/verify", verificationData);
