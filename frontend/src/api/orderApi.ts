import api from './axios';
import type { ApiResponse, CartLine, OrderResponse } from './types';

export interface CreateOrderPayload {
  customerName: string;
  customerMobile: string;
  deliveryAddress: string;
  landmark?: string;
  notes?: string;
  items: { foodItemId: number; quantity: number }[];
}

export function buildOrderPayload(
  cart: CartLine[],
  customer: { name: string; mobile: string; address: string; landmark?: string; notes?: string }
): CreateOrderPayload {
  return {
    customerName: customer.name,
    customerMobile: customer.mobile,
    deliveryAddress: customer.address,
    landmark: customer.landmark,
    notes: customer.notes,
    items: cart.map((c) => ({ foodItemId: c.foodItemId, quantity: c.quantity })),
  };
}

export async function createOrder(payload: CreateOrderPayload): Promise<OrderResponse> {
  const res = await api.post<ApiResponse<OrderResponse>>('/api/orders', payload);
  return res.data.data;
}

export async function trackOrder(token: string): Promise<OrderResponse> {
  const res = await api.get<ApiResponse<OrderResponse>>(`/api/orders/track/${token}`);
  return res.data.data;
}
