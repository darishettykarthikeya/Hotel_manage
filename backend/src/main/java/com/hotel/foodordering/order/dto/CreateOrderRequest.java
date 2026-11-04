package com.hotel.foodordering.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.util.List;

public class CreateOrderRequest {

    @NotBlank
    @Size(max = 120)
    private String customerName;

    // Kept intentionally simple: accepts optional +country code, then 10-15 digits.
    @NotBlank
    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Enter a valid mobile number")
    private String customerMobile;

    @NotBlank
    @Size(max = 500)
    private String deliveryAddress;

    @Size(max = 200)
    private String landmark;

    @Size(max = 500)
    private String notes;

    @NotEmpty
    @Valid
    private List<CreateOrderItemRequest> items;

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getCustomerMobile() { return customerMobile; }
    public void setCustomerMobile(String customerMobile) { this.customerMobile = customerMobile; }
    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }
    public String getLandmark() { return landmark; }
    public void setLandmark(String landmark) { this.landmark = landmark; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public List<CreateOrderItemRequest> getItems() { return items; }
    public void setItems(List<CreateOrderItemRequest> items) { this.items = items; }
}
