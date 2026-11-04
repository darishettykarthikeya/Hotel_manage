package com.hotel.foodordering.order.dto;

import jakarta.validation.constraints.NotNull;

public class AssignDeliveryRequest {
    @NotNull
    private Long deliveryPartnerId;

    public Long getDeliveryPartnerId() { return deliveryPartnerId; }
    public void setDeliveryPartnerId(Long deliveryPartnerId) { this.deliveryPartnerId = deliveryPartnerId; }
}
