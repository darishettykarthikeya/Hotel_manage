package com.hotel.foodordering.order.repository;

import com.hotel.foodordering.order.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
}
