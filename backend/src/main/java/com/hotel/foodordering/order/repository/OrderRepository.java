package com.hotel.foodordering.order.repository;

import com.hotel.foodordering.order.entity.Order;
import com.hotel.foodordering.order.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByTrackingToken(String trackingToken);
    Optional<Order> findByOrderNumber(String orderNumber);
    List<Order> findAllByOrderStatusOrderByCreatedAtDesc(OrderStatus status);
    List<Order> findAllByOrderByCreatedAtDesc();

    // Used to compute how many orders exist "today" for readable order-number generation.
    long countByCreatedAtBetween(java.time.LocalDateTime start, java.time.LocalDateTime end);
}
