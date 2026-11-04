package com.hotel.foodordering.order.entity;

public enum OrderStatus {
    PENDING_PAYMENT,
    PAYMENT_FAILED,
    CONFIRMED,
    PREPARING,
    OUT_FOR_DELIVERY,
    DELIVERED,
    CANCELLED
}
