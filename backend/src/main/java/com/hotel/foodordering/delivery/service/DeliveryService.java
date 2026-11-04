package com.hotel.foodordering.delivery.service;

import com.hotel.foodordering.common.exception.ResourceNotFoundException;
import com.hotel.foodordering.delivery.dto.DeliveryPartnerDto;
import com.hotel.foodordering.delivery.dto.DeliveryPartnerRequest;
import com.hotel.foodordering.delivery.entity.DeliveryPartner;
import com.hotel.foodordering.delivery.repository.DeliveryPartnerRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DeliveryService {

    private final DeliveryPartnerRepository deliveryPartnerRepository;

    public DeliveryService(DeliveryPartnerRepository deliveryPartnerRepository) {
        this.deliveryPartnerRepository = deliveryPartnerRepository;
    }

    public List<DeliveryPartnerDto> getAll() {
        return deliveryPartnerRepository.findAll().stream().map(this::toDto).toList();
    }

    public List<DeliveryPartnerDto> getActive() {
        return deliveryPartnerRepository.findByActiveTrue().stream().map(this::toDto).toList();
    }

    public DeliveryPartnerDto create(DeliveryPartnerRequest request) {
        DeliveryPartner partner = new DeliveryPartner();
        partner.setName(request.getName());
        partner.setMobile(request.getMobile());
        partner.setActive(request.isActive());
        return toDto(deliveryPartnerRepository.save(partner));
    }

    public DeliveryPartnerDto update(Long id, DeliveryPartnerRequest request) {
        DeliveryPartner partner = deliveryPartnerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery partner not found: " + id));
        partner.setName(request.getName());
        partner.setMobile(request.getMobile());
        partner.setActive(request.isActive());
        return toDto(deliveryPartnerRepository.save(partner));
    }

    public DeliveryPartner getEntityById(Long id) {
        return deliveryPartnerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery partner not found: " + id));
    }

    private DeliveryPartnerDto toDto(DeliveryPartner p) {
        return new DeliveryPartnerDto(p.getId(), p.getName(), p.getMobile(), p.isActive());
    }
}
