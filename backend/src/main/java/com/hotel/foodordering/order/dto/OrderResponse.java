package com.hotel.foodordering.order.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * What the customer sees. Deliberately excludes the internal database id
 * and only ever includes the tracking token in the "trackingUrl" the customer receives,
 * never the raw token as a standalone field, and never the numeric order id.
 */
public class OrderResponse {
    private String orderNumber;
    private String orderStatus;
    private String paymentStatus;
    private BigDecimal subtotal;
    private BigDecimal deliveryCharge;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private String deliveryAddress;
    private String landmark;
    private List<OrderItemResponse> items;
    private DeliveryPartnerInfo deliveryPartner; // null until assigned
    private String trackingUrl;
    private LocalDateTime createdAt;

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }
    public String getOrderStatus() { return orderStatus; }
    public void setOrderStatus(String orderStatus) { this.orderStatus = orderStatus; }
    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
    public BigDecimal getDeliveryCharge() { return deliveryCharge; }
    public void setDeliveryCharge(BigDecimal deliveryCharge) { this.deliveryCharge = deliveryCharge; }
    public BigDecimal getTaxAmount() { return taxAmount; }
    public void setTaxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }
    public String getLandmark() { return landmark; }
    public void setLandmark(String landmark) { this.landmark = landmark; }
    public List<OrderItemResponse> getItems() { return items; }
    public void setItems(List<OrderItemResponse> items) { this.items = items; }
    public DeliveryPartnerInfo getDeliveryPartner() { return deliveryPartner; }
    public void setDeliveryPartner(DeliveryPartnerInfo deliveryPartner) { this.deliveryPartner = deliveryPartner; }
    public String getTrackingUrl() { return trackingUrl; }
    public void setTrackingUrl(String trackingUrl) { this.trackingUrl = trackingUrl; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
