package com.hotel.foodordering.payment.dto;

public class CreatePaymentOrderResponse {
    private String razorpayOrderId;
    private String razorpayKeyId;
    private long amountInPaise;
    private String currency;
    private String orderNumber;
    private String customerName;
    private String customerMobile;

    public String getRazorpayOrderId() { return razorpayOrderId; }
    public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }
    public String getRazorpayKeyId() { return razorpayKeyId; }
    public void setRazorpayKeyId(String razorpayKeyId) { this.razorpayKeyId = razorpayKeyId; }
    public long getAmountInPaise() { return amountInPaise; }
    public void setAmountInPaise(long amountInPaise) { this.amountInPaise = amountInPaise; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getCustomerMobile() { return customerMobile; }
    public void setCustomerMobile(String customerMobile) { this.customerMobile = customerMobile; }
}
