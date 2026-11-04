package com.hotel.foodordering.food.controller;

import com.hotel.foodordering.common.response.ApiResponse;
import com.hotel.foodordering.food.dto.FoodItemDto;
import com.hotel.foodordering.food.dto.FoodItemRequest;
import com.hotel.foodordering.food.service.FoodService;
import com.hotel.foodordering.food.service.ImageUploadService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/foods")
public class AdminFoodController {

    private final FoodService foodService;
    private final ImageUploadService imageUploadService;

    public AdminFoodController(FoodService foodService, ImageUploadService imageUploadService) {
        this.foodService = foodService;
        this.imageUploadService = imageUploadService;
    }

    @GetMapping
    public ApiResponse<List<FoodItemDto>> getAll() {
        return ApiResponse.ok(foodService.getAllForAdmin());
    }

    @PostMapping
    public ApiResponse<FoodItemDto> create(@Valid @RequestBody FoodItemRequest request) {
        return ApiResponse.ok("Food item created", foodService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<FoodItemDto> update(@PathVariable Long id, @Valid @RequestBody FoodItemRequest request) {
        return ApiResponse.ok("Food item updated", foodService.update(id, request));
    }

    @PatchMapping("/{id}/availability")
    public ApiResponse<FoodItemDto> setAvailability(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        boolean available = Boolean.TRUE.equals(body.get("available"));
        return ApiResponse.ok("Availability updated", foodService.setAvailability(id, available));
    }

    @PostMapping("/{id}/image")
    public ApiResponse<FoodItemDto> uploadImage(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        String url = imageUploadService.upload(file, "food-items/" + id);
        return ApiResponse.ok("Image uploaded", foodService.updateImageUrl(id, url));
    }
}
