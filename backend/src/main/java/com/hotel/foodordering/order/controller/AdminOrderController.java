package com.hotel.foodordering.order.controller;

import com.hotel.foodordering.common.response.ApiResponse;
import com.hotel.foodordering.order.dto.*;
import com.hotel.foodordering.order.entity.Order;
import com.hotel.foodordering.order.entity.OrderStatus;
import com.hotel.foodordering.order.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

    private final OrderService orderService;

    public AdminOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ApiResponse<List<AdminOrderSummaryResponse>> list(@RequestParam(required = false) String status) {
        List<Order> orders = (status == null || status.isBlank())
                ? orderService.getAllForAdmin()
                : orderService.getByStatusForAdmin(OrderStatus.valueOf(status.trim().toUpperCase()));
        return ApiResponse.ok(orders.stream().map(orderService::toAdminSummary).toList());
    }

    @GetMapping("/{id}")
    public ApiResponse<AdminOrderDetailResponse> getDetail(@PathVariable Long id) {
        Order order = orderService.getByIdOrThrow(id);
        return ApiResponse.ok(orderService.toAdminDetail(order));
    }

    @PutMapping("/{id}/status")
    public ApiResponse<AdminOrderDetailResponse> updateStatus(@PathVariable Long id,
                                                                @Valid @RequestBody UpdateOrderStatusRequest request,
                                                                Authentication authentication) {
        String changedBy = authentication != null ? String.valueOf(authentication.getPrincipal()) : "admin";
        Order order = orderService.updateStatus(id, request.getStatus(), changedBy);
        return ApiResponse.ok("Order status updated", orderService.toAdminDetail(order));
    }

    @PutMapping("/{id}/delivery")
    public ApiResponse<AdminOrderDetailResponse> assignDelivery(@PathVariable Long id,
                                                                  @Valid @RequestBody AssignDeliveryRequest request) {
        Order order = orderService.assignDeliveryPartner(id, request.getDeliveryPartnerId());
        return ApiResponse.ok("Delivery partner assigned", orderService.toAdminDetail(order));
    }
}
