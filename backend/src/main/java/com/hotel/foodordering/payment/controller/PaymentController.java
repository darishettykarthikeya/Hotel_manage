package com.hotel.foodordering.payment.controller;

import com.hotel.foodordering.common.response.ApiResponse;
import com.hotel.foodordering.order.service.OrderService;
import com.hotel.foodordering.payment.dto.CreatePaymentOrderRequest;
import com.hotel.foodordering.payment.dto.CreatePaymentOrderResponse;
import com.hotel.foodordering.payment.dto.VerifyPaymentRequest;
import com.hotel.foodordering.payment.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final OrderService orderService;

    public PaymentController(PaymentService paymentService, OrderService orderService) {
        this.paymentService = paymentService;
        this.orderService = orderService;
    }

    @PostMapping("/create-order")
    public ApiResponse<CreatePaymentOrderResponse> createPaymentOrder(@Valid @RequestBody CreatePaymentOrderRequest request) {
        return ApiResponse.ok(paymentService.createPaymentOrder(request.getOrderNumber()));
    }

    @PostMapping("/verify")
    public ApiResponse<?> verify(@Valid @RequestBody VerifyPaymentRequest request) {
        var order = paymentService.verifyPayment(request);
        return ApiResponse.ok("Payment verified", orderService.toCustomerResponse(order));
    }

    // Razorpay calls this server-to-server. Configure the same URL + secret in the Razorpay dashboard.
    @PostMapping("/webhook")
    public ApiResponse<Void> webhook(@RequestBody String rawPayload,
                                      @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature) {
        paymentService.handleWebhook(rawPayload, signature);
        return ApiResponse.ok(null);
    }
}
