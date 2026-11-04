package com.hotel.foodordering.delivery.controller;

import com.hotel.foodordering.common.response.ApiResponse;
import com.hotel.foodordering.delivery.dto.DeliveryPartnerDto;
import com.hotel.foodordering.delivery.dto.DeliveryPartnerRequest;
import com.hotel.foodordering.delivery.service.DeliveryService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/delivery-partners")
public class AdminDeliveryController {

    private final DeliveryService deliveryService;

    public AdminDeliveryController(DeliveryService deliveryService) {
        this.deliveryService = deliveryService;
    }

    @GetMapping
    public ApiResponse<List<DeliveryPartnerDto>> getAll() {
        return ApiResponse.ok(deliveryService.getAll());
    }

    @PostMapping
    public ApiResponse<DeliveryPartnerDto> create(@Valid @RequestBody DeliveryPartnerRequest request) {
        return ApiResponse.ok("Delivery partner added", deliveryService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<DeliveryPartnerDto> update(@PathVariable Long id, @Valid @RequestBody DeliveryPartnerRequest request) {
        return ApiResponse.ok("Delivery partner updated", deliveryService.update(id, request));
    }
}
