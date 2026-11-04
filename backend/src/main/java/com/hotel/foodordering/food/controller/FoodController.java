package com.hotel.foodordering.food.controller;

import com.hotel.foodordering.common.response.ApiResponse;
import com.hotel.foodordering.food.dto.FoodItemDto;
import com.hotel.foodordering.food.service.FoodService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Public, read-only endpoints used by the customer-facing menu.
@RestController
@RequestMapping("/api/foods")
public class FoodController {

    private final FoodService foodService;

    public FoodController(FoodService foodService) {
        this.foodService = foodService;
    }

    @GetMapping
    public ApiResponse<List<FoodItemDto>> list(@RequestParam(required = false) Long categoryId,
                                                 @RequestParam(required = false) String search) {
        return ApiResponse.ok(foodService.getAvailableFoods(categoryId, search));
    }

    @GetMapping("/{id}")
    public ApiResponse<FoodItemDto> getById(@PathVariable Long id) {
        return ApiResponse.ok(foodService.getById(id));
    }
}
