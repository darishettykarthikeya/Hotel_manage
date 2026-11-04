package com.hotel.foodordering.delivery.dto;

public class DeliveryPartnerDto {
    private Long id;
    private String name;
    private String mobile;
    private boolean active;

    public DeliveryPartnerDto() {}

    public DeliveryPartnerDto(Long id, String name, String mobile, boolean active) {
        this.id = id;
        this.name = name;
        this.mobile = mobile;
        this.active = active;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
