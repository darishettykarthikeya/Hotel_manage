import api from './axios';
import type { ApiResponse, OrderResponse } from './types';

export interface CreatePaymentOrderResponse {
  razorpayOrderId: string;
  razorpayKeyId: string;
  amountInPaise: number;
  currency: string;
  orderNumber: string;
  customerName: string;
  customerMobile: string;
}

export async function createPaymentOrder(orderNumber: string): Promise<CreatePaymentOrderResponse> {
  const res = await api.post<ApiResponse<CreatePaymentOrderResponse>>('/api/payments/create-order', {
    orderNumber,
  });
  return res.data.data;
}

export interface VerifyPaymentPayload {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export async function verifyPayment(payload: VerifyPaymentPayload): Promise<OrderResponse> {
  const res = await api.post<ApiResponse<OrderResponse>>('/api/payments/verify', payload);
  return res.data.data;
}
