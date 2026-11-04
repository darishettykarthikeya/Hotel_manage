package com.hotel.foodordering.category.controller;

import com.hotel.foodordering.category.dto.CategoryDto;
import com.hotel.foodordering.category.service.CategoryService;
import com.hotel.foodordering.common.response.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// Public, read-only endpoint used by the customer-facing menu.
@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ApiResponse<List<CategoryDto>> getActiveCategories() {
        return ApiResponse.ok(categoryService.getActiveCategories());
    }
}
