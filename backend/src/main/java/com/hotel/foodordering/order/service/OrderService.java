package com.hotel.foodordering.order.service;

import com.hotel.foodordering.common.exception.BadRequestException;
import com.hotel.foodordering.common.exception.ResourceNotFoundException;
import com.hotel.foodordering.delivery.entity.DeliveryPartner;
import com.hotel.foodordering.delivery.repository.DeliveryPartnerRepository;
import com.hotel.foodordering.food.entity.FoodItem;
import com.hotel.foodordering.food.repository.FoodItemRepository;
import com.hotel.foodordering.order.dto.*;
import com.hotel.foodordering.order.entity.*;
import com.hotel.foodordering.order.repository.OrderRepository;
import com.hotel.foodordering.order.repository.OrderStatusHistoryRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;
import java.util.Set;

@Service
public class OrderService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final DateTimeFormatter ORDER_NUMBER_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd");

    private final OrderRepository orderRepository;
    private final FoodItemRepository foodItemRepository;
    private final DeliveryPartnerRepository deliveryPartnerRepository;
    private final OrderStatusHistoryRepository statusHistoryRepository;

    @Value("${app.order.tracking-link-base}")
    private String trackingLinkBase;

    @Value("${app.order.tracking-token-expiry-days}")
    private int trackingTokenExpiryDays;

    @Value("${app.order.cancellable-statuses}")
    private String cancellableStatusesRaw;

    public OrderService(OrderRepository orderRepository,
                         FoodItemRepository foodItemRepository,
                         DeliveryPartnerRepository deliveryPartnerRepository,
                         OrderStatusHistoryRepository statusHistoryRepository) {
        this.orderRepository = orderRepository;
        this.foodItemRepository = foodItemRepository;
        this.deliveryPartnerRepository = deliveryPartnerRepository;
        this.statusHistoryRepository = statusHistoryRepository;
    }

    /**
     * Creates a guest order. Every price used here comes from the database, never from the
     * request body, so a tampered browser total can never change what gets charged.
     */
    @Transactional
    public Order createOrder(CreateOrderRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BadRequestException("Cart cannot be empty");
        }

        Order order = new Order();
        order.setCustomerName(request.getCustomerName().trim());
        order.setCustomerMobile(request.getCustomerMobile().trim());
        order.setDeliveryAddress(request.getDeliveryAddress().trim());
        order.setLandmark(request.getLandmark() != null ? request.getLandmark().trim() : null);
        order.setNotes(request.getNotes() != null ? request.getNotes().trim() : null);

        BigDecimal subtotal = BigDecimal.ZERO;

        for (CreateOrderItemRequest itemReq : request.getItems()) {
            FoodItem food = foodItemRepository.findById(itemReq.getFoodItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("Food item not found: " + itemReq.getFoodItemId()));

            if (!food.isAvailable()) {
                throw new BadRequestException(food.getName() + " is currently unavailable");
            }
            if (itemReq.getQuantity() < 1) {
                throw new BadRequestException("Quantity must be at least 1 for " + food.getName());
            }

            BigDecimal unitPrice = food.getPrice(); // authoritative price straight from MySQL
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity()))
                    .setScale(2, RoundingMode.HALF_UP);

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setFoodItem(food);
            orderItem.setFoodNameSnapshot(food.getName());
            orderItem.setUnitPrice(unitPrice);
            orderItem.setQuantity(itemReq.getQuantity());
            orderItem.setLineTotal(lineTotal);
            order.getItems().add(orderItem);

            subtotal = subtotal.add(lineTotal);
        }

        BigDecimal deliveryCharge = calculateDeliveryCharge(subtotal);
        BigDecimal taxAmount = calculateTax(subtotal);
        BigDecimal totalAmount = subtotal.add(deliveryCharge).add(taxAmount).setScale(2, RoundingMode.HALF_UP);

        order.setSubtotal(subtotal.setScale(2, RoundingMode.HALF_UP));
        order.setDeliveryCharge(deliveryCharge.setScale(2, RoundingMode.HALF_UP));
        order.setTaxAmount(taxAmount.setScale(2, RoundingMode.HALF_UP));
        order.setTotalAmount(totalAmount);
        order.setOrderStatus(OrderStatus.PENDING_PAYMENT);
        order.setPaymentStatus(PaymentStatus.CREATED);
        order.setOrderNumber(generateOrderNumber());
        order.setTrackingToken(generateTrackingToken());
        order.setTrackingTokenExpiresAt(LocalDateTime.now().plusDays(trackingTokenExpiryDays));

        return orderRepository.save(order);
    }

    // Simple, adjustable business rules. Swap for a real delivery-charge/tax engine as needed.
    private BigDecimal calculateDeliveryCharge(BigDecimal subtotal) {
        if (subtotal.compareTo(BigDecimal.valueOf(500)) >= 0) {
            return BigDecimal.ZERO; // free delivery above 500
        }
        return BigDecimal.valueOf(40);
    }

    private BigDecimal calculateTax(BigDecimal subtotal) {
        return BigDecimal.ZERO; // set a GST rate here if your hotel needs to show tax separately
    }

    private String generateOrderNumber() {
        String datePart = LocalDate.now().format(ORDER_NUMBER_DATE_FORMAT);
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        long countToday = orderRepository.countByCreatedAtBetween(startOfDay, endOfDay);
        String sequence = String.format("%03d", countToday + 1);
        String candidate = "H" + datePart + sequence;
        // Extremely unlikely collision guard (e.g. concurrent inserts); fall back to a random suffix.
        while (orderRepository.findByOrderNumber(candidate).isPresent()) {
            candidate = candidate + SECURE_RANDOM.nextInt(10);
        }
        return candidate;
    }

    /**
     * Cryptographically secure, URL-safe tracking token. Never derived from or containing
     * the numeric database id, so guessing/incrementing an id cannot expose another order.
     */
    private String generateTrackingToken() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        while (orderRepository.findByTrackingToken(token).isPresent()) {
            SECURE_RANDOM.nextBytes(bytes);
            token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        }
        return token;
    }

    public Order getByIdOrThrow(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));
    }

    public Order getByOrderNumberOrThrow(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderNumber));
    }

    @Transactional(readOnly = true)
    public Order getByTrackingTokenOrThrow(String token) {
        Order order = orderRepository.findByTrackingToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found or link is invalid"));
        if (order.getTrackingTokenExpiresAt() != null
                && order.getTrackingTokenExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ResourceNotFoundException("This tracking link has expired");
        }
        return order;
    }

    @Transactional
    public Order updateStatus(Long orderId, String newStatusRaw, String changedBy) {
        Order order = getByIdOrThrow(orderId);
        OrderStatus newStatus = parseStatus(newStatusRaw);

        if (newStatus == OrderStatus.CANCELLED) {
            Set<String> cancellable = Set.of(cancellableStatusesRaw.split(","));
            if (!cancellable.contains(order.getOrderStatus().name())) {
                throw new BadRequestException("Order can no longer be cancelled at status " + order.getOrderStatus());
            }
        }

        OrderStatus oldStatus = order.getOrderStatus();
        order.setOrderStatus(newStatus);
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);

        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrder(order);
        history.setOldStatus(oldStatus.name());
        history.setNewStatus(newStatus.name());
        history.setChangedBy(changedBy);
        statusHistoryRepository.save(history);

        return order;
    }

    @Transactional
    public Order assignDeliveryPartner(Long orderId, Long deliveryPartnerId) {
        Order order = getByIdOrThrow(orderId);
        DeliveryPartner partner = deliveryPartnerRepository.findById(deliveryPartnerId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery partner not found: " + deliveryPartnerId));
        if (!partner.isActive()) {
            throw new BadRequestException("Delivery partner is not active");
        }
        order.setDeliveryPartner(partner);
        order.setUpdatedAt(LocalDateTime.now());
        return orderRepository.save(order);
    }

    public List<Order> getAllForAdmin() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Order> getByStatusForAdmin(OrderStatus status) {
        return orderRepository.findAllByOrderStatusOrderByCreatedAtDesc(status);
    }

    private OrderStatus parseStatus(String raw) {
        try {
            return OrderStatus.valueOf(raw.trim().toUpperCase());
        } catch (Exception e) {
            throw new BadRequestException("Unknown order status: " + raw + ". Valid values: "
                    + Arrays.toString(OrderStatus.values()));
        }
    }

    // ---- Response mapping ----

    public OrderResponse toCustomerResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setOrderNumber(order.getOrderNumber());
        response.setOrderStatus(order.getOrderStatus().name());
        response.setPaymentStatus(order.getPaymentStatus().name());
        response.setSubtotal(order.getSubtotal());
        response.setDeliveryCharge(order.getDeliveryCharge());
        response.setTaxAmount(order.getTaxAmount());
        response.setTotalAmount(order.getTotalAmount());
        response.setDeliveryAddress(order.getDeliveryAddress());
        response.setLandmark(order.getLandmark());
        response.setCreatedAt(order.getCreatedAt());
        response.setItems(order.getItems().stream()
                .map(i -> new OrderItemResponse(i.getFoodNameSnapshot(), i.getUnitPrice(), i.getQuantity(), i.getLineTotal()))
                .toList());
        if (order.getDeliveryPartner() != null) {
            response.setDeliveryPartner(new DeliveryPartnerInfo(
                    order.getDeliveryPartner().getName(), order.getDeliveryPartner().getMobile()));
        }
        response.setTrackingUrl(trackingLinkBase + "/" + order.getTrackingToken());
        return response;
    }

    public AdminOrderSummaryResponse toAdminSummary(Order order) {
        AdminOrderSummaryResponse r = new AdminOrderSummaryResponse();
        r.setId(order.getId());
        r.setOrderNumber(order.getOrderNumber());
        r.setCustomerName(order.getCustomerName());
        r.setCustomerMobile(order.getCustomerMobile());
        r.setTotalAmount(order.getTotalAmount());
        r.setOrderStatus(order.getOrderStatus().name());
        r.setPaymentStatus(order.getPaymentStatus().name());
        r.setCreatedAt(order.getCreatedAt());
        return r;
    }

    public AdminOrderDetailResponse toAdminDetail(Order order) {
        AdminOrderDetailResponse r = new AdminOrderDetailResponse();
        r.setId(order.getId());
        r.setOrderNumber(order.getOrderNumber());
        r.setCustomerName(order.getCustomerName());
        r.setCustomerMobile(order.getCustomerMobile());
        r.setDeliveryAddress(order.getDeliveryAddress());
        r.setLandmark(order.getLandmark());
        r.setNotes(order.getNotes());
        r.setSubtotal(order.getSubtotal());
        r.setDeliveryCharge(order.getDeliveryCharge());
        r.setTaxAmount(order.getTaxAmount());
        r.setTotalAmount(order.getTotalAmount());
        r.setOrderStatus(order.getOrderStatus().name());
        r.setPaymentStatus(order.getPaymentStatus().name());
        if (order.getDeliveryPartner() != null) {
            r.setDeliveryPartnerId(order.getDeliveryPartner().getId());
            r.setDeliveryPartnerName(order.getDeliveryPartner().getName());
            r.setDeliveryPartnerMobile(order.getDeliveryPartner().getMobile());
        }
        r.setItems(order.getItems().stream()
                .map(i -> new OrderItemResponse(i.getFoodNameSnapshot(), i.getUnitPrice(), i.getQuantity(), i.getLineTotal()))
                .toList());
        r.setCreatedAt(order.getCreatedAt());
        r.setUpdatedAt(order.getUpdatedAt());
        return r;
    }
}
