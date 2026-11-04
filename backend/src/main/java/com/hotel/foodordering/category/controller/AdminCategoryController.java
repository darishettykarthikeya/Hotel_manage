package com.hotel.foodordering.category.controller;

import com.hotel.foodordering.category.dto.CategoryDto;
import com.hotel.foodordering.category.dto.CategoryRequest;
import com.hotel.foodordering.category.service.CategoryService;
import com.hotel.foodordering.common.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/categories")
public class AdminCategoryController {

    private final CategoryService categoryService;

    public AdminCategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ApiResponse<List<CategoryDto>> getAll() {
        return ApiResponse.ok(categoryService.getAllCategoriesForAdmin());
    }

    @PostMapping
    public ApiResponse<CategoryDto> create(@Valid @RequestBody CategoryRequest request) {
        return ApiResponse.ok("Category created", categoryService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<CategoryDto> update(@PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
        return ApiResponse.ok("Category updated", categoryService.update(id, request));
    }
}
