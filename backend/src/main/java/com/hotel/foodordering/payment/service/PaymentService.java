package com.hotel.foodordering.payment.service;

import com.hotel.foodordering.common.exception.BadRequestException;
import com.hotel.foodordering.common.exception.PaymentVerificationException;
import com.hotel.foodordering.order.entity.Order;
import com.hotel.foodordering.order.entity.OrderStatus;
import com.hotel.foodordering.order.entity.PaymentStatus;
import com.hotel.foodordering.order.repository.OrderRepository;
import com.hotel.foodordering.order.service.OrderService;
import com.hotel.foodordering.payment.dto.CreatePaymentOrderResponse;
import com.hotel.foodordering.payment.dto.VerifyPaymentRequest;
import com.hotel.foodordering.payment.entity.Payment;
import com.hotel.foodordering.payment.repository.PaymentRepository;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.HexFormat;

@Service
public class PaymentService {

    private final RazorpayClient razorpayClient;
    private final OrderRepository orderRepository;
    private final OrderService orderService;
    private final PaymentRepository paymentRepository;

    @Value("${app.razorpay.key-id}")
    private String keyId;

    @Value("${app.razorpay.key-secret}")
    private String keySecret;

    @Value("${app.razorpay.webhook-secret}")
    private String webhookSecret;

    @Value("${app.razorpay.currency}")
    private String currency;

    public PaymentService(RazorpayClient razorpayClient,
                           OrderRepository orderRepository,
                           OrderService orderService,
                           PaymentRepository paymentRepository) {
        this.razorpayClient = razorpayClient;
        this.orderRepository = orderRepository;
        this.orderService = orderService;
        this.paymentRepository = paymentRepository;
    }

    @Transactional
    public CreatePaymentOrderResponse createPaymentOrder(String orderNumber) {
        Order order = orderService.getByOrderNumberOrThrow(orderNumber);

        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            throw new BadRequestException("This order has already been paid for");
        }
        if (order.getOrderStatus() == OrderStatus.CANCELLED) {
            throw new BadRequestException("This order was cancelled");
        }

        // Amount is recalculated from the order stored in MySQL, never trusted from the client.
        long amountInPaise = order.getTotalAmount().multiply(BigDecimal.valueOf(100)).longValueExact();

        try {
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", currency);
            orderRequest.put("receipt", order.getOrderNumber());
            orderRequest.put("payment_capture", 1);

            com.razorpay.Order rzpOrder = razorpayClient.orders.create(orderRequest);
            String rzpOrderId = rzpOrder.get("id");

            Payment payment = paymentRepository.findByOrderId(order.getId()).orElse(new Payment());
            payment.setOrder(order);
            payment.setProvider("RAZORPAY");
            payment.setProviderOrderId(rzpOrderId);
            payment.setAmount(order.getTotalAmount());
            payment.setCurrency(currency);
            payment.setStatus(PaymentStatus.PENDING);
            paymentRepository.save(payment);

            order.setPaymentStatus(PaymentStatus.PENDING);
            orderRepository.save(order);

            CreatePaymentOrderResponse response = new CreatePaymentOrderResponse();
            response.setRazorpayOrderId(rzpOrderId);
            response.setRazorpayKeyId(keyId);
            response.setAmountInPaise(amountInPaise);
            response.setCurrency(currency);
            response.setOrderNumber(order.getOrderNumber());
            response.setCustomerName(order.getCustomerName());
            response.setCustomerMobile(order.getCustomerMobile());
            return response;
        } catch (RazorpayException e) {
            throw new BadRequestException("Failed to create payment order: " + e.getMessage());
        }
    }

    /**
     * Verifies the signature Razorpay Checkout returns to the browser after payment.
     * The browser's "success" callback is never trusted on its own -- this HMAC check,
     * done with the secret key that only the backend holds, is what actually confirms payment.
     */
    @Transactional
    public Order verifyPayment(VerifyPaymentRequest request) {
        Payment payment = paymentRepository.findByProviderOrderId(request.getRazorpayOrderId())
                .orElseThrow(() -> new BadRequestException("No payment found for this order"));

        Order order = payment.getOrder();

        String payload = request.getRazorpayOrderId() + "|" + request.getRazorpayPaymentId();
        boolean validSignature = verifyHmacSha256(payload, request.getRazorpaySignature(), keySecret);

        if (!validSignature) {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setSignatureVerified(false);
            paymentRepository.save(payment);

            order.setPaymentStatus(PaymentStatus.FAILED);
            order.setOrderStatus(OrderStatus.PAYMENT_FAILED);
            orderRepository.save(order);

            throw new PaymentVerificationException("Payment signature verification failed");
        }

        markPaymentPaid(payment, order, request.getRazorpayPaymentId());
        return order;
    }

    /**
     * Handles the Razorpay webhook, which is the authoritative confirmation in production
     * (browser callbacks can be interrupted by a closed tab, lost network, etc).
     * Verifies the webhook signature and is idempotent so retried/duplicate events are safe.
     */
    @Transactional
    public void handleWebhook(String rawPayload, String signatureHeader) {
        if (!verifyHmacSha256(rawPayload, signatureHeader, webhookSecret)) {
            throw new PaymentVerificationException("Invalid webhook signature");
        }

        JSONObject body = new JSONObject(rawPayload);
        String event = body.optString("event", "");

        if (!event.startsWith("payment.")) {
            return; // ignore events we don't care about
        }

        JSONObject paymentEntity = body.getJSONObject("payload")
                .getJSONObject("payment")
                .getJSONObject("entity");

        String providerPaymentId = paymentEntity.optString("id", null);
        String providerOrderId = paymentEntity.optString("order_id", null);

        if (providerOrderId == null) {
            return;
        }

        Payment payment = paymentRepository.findByProviderOrderId(providerOrderId).orElse(null);
        if (payment == null) {
            return; // unknown order, nothing to reconcile
        }

        // Idempotency: if we've already recorded this exact payment as PAID, do nothing.
        if (payment.getStatus() == PaymentStatus.PAID
                && providerPaymentId != null
                && providerPaymentId.equals(payment.getProviderPaymentId())) {
            return;
        }

        Order order = payment.getOrder();

        if ("payment.captured".equals(event)) {
            markPaymentPaid(payment, order, providerPaymentId);
        } else if ("payment.failed".equals(event)) {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            order.setPaymentStatus(PaymentStatus.FAILED);
            order.setOrderStatus(OrderStatus.PAYMENT_FAILED);
            orderRepository.save(order);
        }
    }

    private void markPaymentPaid(Payment payment, Order order, String providerPaymentId) {
        payment.setProviderPaymentId(providerPaymentId);
        payment.setStatus(PaymentStatus.PAID);
        payment.setSignatureVerified(true);
        payment.setPaidAt(LocalDateTime.now());
        paymentRepository.save(payment);

        order.setPaymentStatus(PaymentStatus.PAID);
        if (order.getOrderStatus() == OrderStatus.PENDING_PAYMENT || order.getOrderStatus() == OrderStatus.PAYMENT_FAILED) {
            order.setOrderStatus(OrderStatus.CONFIRMED);
        }
        orderRepository.save(order);
    }

    private boolean verifyHmacSha256(String payload, String receivedSignature, String secret) {
        if (receivedSignature == null || secret == null) {
            return false;
        }
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] computed = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String computedHex = HexFormat.of().formatHex(computed);
            return constantTimeEquals(computedHex, receivedSignature);
        } catch (Exception e) {
            return false;
        }
    }

    private boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null) return false;
        return MessageDigest.isEqual(a.getBytes(StandardCharsets.UTF_8), b.getBytes(StandardCharsets.UTF_8));
    }
}
