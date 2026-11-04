package com.hotel.foodordering.order.controller;

import com.hotel.foodordering.common.response.ApiResponse;
import com.hotel.foodordering.order.dto.CreateOrderRequest;
import com.hotel.foodordering.order.dto.OrderResponse;
import com.hotel.foodordering.order.entity.Order;
import com.hotel.foodordering.order.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // Public: guest checkout, no login required.
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<OrderResponse> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        Order order = orderService.createOrder(request);
        return ApiResponse.ok("Order created. Proceed to payment.", orderService.toCustomerResponse(order));
    }

    // Public: secure guest order tracking via random token, never the numeric id.
    @GetMapping("/track/{token}")
    public ApiResponse<OrderResponse> track(@PathVariable String token) {
        Order order = orderService.getByTrackingTokenOrThrow(token);
        return ApiResponse.ok(orderService.toCustomerResponse(order));
    }
}
