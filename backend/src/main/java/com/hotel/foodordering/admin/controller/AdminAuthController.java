package com.hotel.foodordering.admin.controller;

import com.hotel.foodordering.admin.dto.LoginRequest;
import com.hotel.foodordering.admin.dto.LoginResponse;
import com.hotel.foodordering.admin.service.AdminAuthService;
import com.hotel.foodordering.common.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminAuthController {

    private final AdminAuthService adminAuthService;

    public AdminAuthController(AdminAuthService adminAuthService) {
        this.adminAuthService = adminAuthService;
    }

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.ok(adminAuthService.login(request));
    }
}
