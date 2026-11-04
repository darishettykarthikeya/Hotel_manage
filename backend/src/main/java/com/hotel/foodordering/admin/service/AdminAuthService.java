package com.hotel.foodordering.admin.service;

import com.hotel.foodordering.admin.dto.LoginRequest;
import com.hotel.foodordering.admin.dto.LoginResponse;
import com.hotel.foodordering.admin.entity.AdminUser;
import com.hotel.foodordering.admin.repository.AdminUserRepository;
import com.hotel.foodordering.common.exception.UnauthorizedException;
import com.hotel.foodordering.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AdminAuthService {

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AdminAuthService(AdminUserRepository adminUserRepository,
                             PasswordEncoder passwordEncoder,
                             JwtUtil jwtUtil) {
        this.adminUserRepository = adminUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public LoginResponse login(LoginRequest request) {
        AdminUser admin = adminUserRepository.findByEmailAndActiveTrue(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), admin.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(admin.getId(), admin.getEmail(), admin.getRole());
        return new LoginResponse(token, admin.getName(), admin.getEmail(), admin.getRole());
    }
}
