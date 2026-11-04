import api from './axios';
import type { ApiResponse, Category, FoodItem } from './types';

export async function getCategories(): Promise<Category[]> {
  const res = await api.get<ApiResponse<Category[]>>('/api/categories');
  return res.data.data;
}

export async function getFoods(categoryId?: number, search?: string): Promise<FoodItem[]> {
  const res = await api.get<ApiResponse<FoodItem[]>>('/api/foods', {
    params: { categoryId, search: search || undefined },
  });
  return res.data.data;
}
