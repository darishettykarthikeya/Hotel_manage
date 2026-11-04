package com.hotel.foodordering.delivery.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class DeliveryPartnerRequest {

    @NotBlank
    private String name;

    @NotBlank
    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Enter a valid mobile number")
    private String mobile;

    private boolean active = true;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
