package com.hotel.foodordering.admin.repository;

import com.hotel.foodordering.admin.entity.AdminUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdminUserRepository extends JpaRepository<AdminUser, Long> {
    Optional<AdminUser> findByEmailAndActiveTrue(String email);
}
