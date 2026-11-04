package com.hotel.foodordering.payment.dto;

import jakarta.validation.constraints.NotBlank;

public class CreatePaymentOrderRequest {
    @NotBlank
    private String orderNumber;

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }
}
