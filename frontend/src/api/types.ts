export interface Category {
  id: number;
  name: string;
  description: string | null;
  active: boolean;
  displayOrder: number;
}

export interface FoodItem {
  id: number;
  categoryId: number;
  categoryName: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  available: boolean;
  veg: boolean | null;
  preparationTimeMinutes: number | null;
}

export interface CartLine {
  foodItemId: number;
  name: string;
  price: number;
  quantity: number;
}

export interface OrderItemResponse {
  foodName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface DeliveryPartnerInfo {
  name: string;
  mobile: string;
}

export interface OrderResponse {
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  subtotal: number;
  deliveryCharge: number;
  taxAmount: number;
  totalAmount: number;
  deliveryAddress: string;
  landmark: string | null;
  items: OrderItemResponse[];
  deliveryPartner: DeliveryPartnerInfo | null;
  trackingUrl: string;
  createdAt: string;
}

export interface AdminOrderSummary {
  id: number;
  orderNumber: string;
  customerName: string;
  customerMobile: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
}

export interface AdminOrderDetail extends AdminOrderSummary {
  deliveryAddress: string;
  landmark: string | null;
  notes: string | null;
  subtotal: number;
  deliveryCharge: number;
  taxAmount: number;
  deliveryPartnerId: number | null;
  deliveryPartnerName: string | null;
  deliveryPartnerMobile: string | null;
  items: OrderItemResponse[];
  updatedAt: string;
}

export interface DeliveryPartner {
  id: number;
  name: string;
  mobile: string;
  active: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T;
  timestamp: string;
}
