package com.hotel.foodordering.order.dto;

public class DeliveryPartnerInfo {
    private String name;
    private String mobile;

    public DeliveryPartnerInfo(String name, String mobile) {
        this.name = name;
        this.mobile = mobile;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }
}
