package com.hotel.foodordering.payment.repository;

import com.hotel.foodordering.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByProviderOrderId(String providerOrderId);
    Optional<Payment> findByProviderPaymentId(String providerPaymentId);
    Optional<Payment> findByOrderId(Long orderId);
}
