package com.hotel.foodordering.delivery.repository;

import com.hotel.foodordering.delivery.entity.DeliveryPartner;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DeliveryPartnerRepository extends JpaRepository<DeliveryPartner, Long> {
    List<DeliveryPartner> findByActiveTrue();
}
