import api from './axios';
import type {
  AdminOrderDetail,
  AdminOrderSummary,
  ApiResponse,
  Category,
  DeliveryPartner,
  FoodItem,
} from './types';

// ---- Auth ----
export interface LoginResponse {
  token: string;
  name: string;
  email: string;
  role: string;
}

export async function adminLogin(email: string, password: string): Promise<LoginResponse> {
  const res = await api.post<ApiResponse<LoginResponse>>('/api/admin/login', { email, password });
  return res.data.data;
}

// ---- Categories ----
export async function getAdminCategories(): Promise<Category[]> {
  const res = await api.get<ApiResponse<Category[]>>('/api/admin/categories');
  return res.data.data;
}

export async function createCategory(payload: Partial<Category>): Promise<Category> {
  const res = await api.post<ApiResponse<Category>>('/api/admin/categories', payload);
  return res.data.data;
}

export async function updateCategory(id: number, payload: Partial<Category>): Promise<Category> {
  const res = await api.put<ApiResponse<Category>>(`/api/admin/categories/${id}`, payload);
  return res.data.data;
}

// ---- Foods ----
export async function getAdminFoods(): Promise<FoodItem[]> {
  const res = await api.get<ApiResponse<FoodItem[]>>('/api/admin/foods');
  return res.data.data;
}

export async function createFood(payload: Partial<FoodItem>): Promise<FoodItem> {
  const res = await api.post<ApiResponse<FoodItem>>('/api/admin/foods', payload);
  return res.data.data;
}

export async function updateFood(id: number, payload: Partial<FoodItem>): Promise<FoodItem> {
  const res = await api.put<ApiResponse<FoodItem>>(`/api/admin/foods/${id}`, payload);
  return res.data.data;
}

export async function setFoodAvailability(id: number, available: boolean): Promise<FoodItem> {
  const res = await api.patch<ApiResponse<FoodItem>>(`/api/admin/foods/${id}/availability`, { available });
  return res.data.data;
}

export async function uploadFoodImage(id: number, file: File): Promise<FoodItem> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post<ApiResponse<FoodItem>>(`/api/admin/foods/${id}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
}

// ---- Orders ----
export async function getAdminOrders(status?: string): Promise<AdminOrderSummary[]> {
  const res = await api.get<ApiResponse<AdminOrderSummary[]>>('/api/admin/orders', {
    params: { status: status || undefined },
  });
  return res.data.data;
}

export async function getAdminOrderDetail(id: number): Promise<AdminOrderDetail> {
  const res = await api.get<ApiResponse<AdminOrderDetail>>(`/api/admin/orders/${id}`);
  return res.data.data;
}

export async function updateOrderStatus(id: number, status: string): Promise<AdminOrderDetail> {
  const res = await api.put<ApiResponse<AdminOrderDetail>>(`/api/admin/orders/${id}/status`, { status });
  return res.data.data;
}

export async function assignDeliveryPartner(id: number, deliveryPartnerId: number): Promise<AdminOrderDetail> {
  const res = await api.put<ApiResponse<AdminOrderDetail>>(`/api/admin/orders/${id}/delivery`, {
    deliveryPartnerId,
  });
  return res.data.data;
}

// ---- Delivery Partners ----
export async function getDeliveryPartners(): Promise<DeliveryPartner[]> {
  const res = await api.get<ApiResponse<DeliveryPartner[]>>('/api/admin/delivery-partners');
  return res.data.data;
}

export async function createDeliveryPartner(payload: Partial<DeliveryPartner>): Promise<DeliveryPartner> {
  const res = await api.post<ApiResponse<DeliveryPartner>>('/api/admin/delivery-partners', payload);
  return res.data.data;
}

export async function updateDeliveryPartner(id: number, payload: Partial<DeliveryPartner>): Promise<DeliveryPartner> {
  const res = await api.put<ApiResponse<DeliveryPartner>>(`/api/admin/delivery-partners/${id}`, payload);
  return res.data.data;
}
