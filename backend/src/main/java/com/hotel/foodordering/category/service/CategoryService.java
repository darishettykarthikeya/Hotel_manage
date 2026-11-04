package com.hotel.foodordering.category.service;

import com.hotel.foodordering.category.dto.CategoryDto;
import com.hotel.foodordering.category.dto.CategoryRequest;
import com.hotel.foodordering.category.entity.Category;
import com.hotel.foodordering.category.repository.CategoryRepository;
import com.hotel.foodordering.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<CategoryDto> getActiveCategories() {
        return categoryRepository.findByActiveTrueOrderByDisplayOrderAsc()
                .stream().map(this::toDto).toList();
    }

    public List<CategoryDto> getAllCategoriesForAdmin() {
        return categoryRepository.findAllByOrderByDisplayOrderAsc()
                .stream().map(this::toDto).toList();
    }

    public CategoryDto create(CategoryRequest request) {
        Category category = new Category();
        applyRequest(category, request);
        return toDto(categoryRepository.save(category));
    }

    public CategoryDto update(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + id));
        applyRequest(category, request);
        category.setUpdatedAt(LocalDateTime.now());
        return toDto(categoryRepository.save(category));
    }

    private void applyRequest(Category category, CategoryRequest request) {
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setActive(request.isActive());
        category.setDisplayOrder(request.getDisplayOrder());
    }

    private CategoryDto toDto(Category c) {
        return new CategoryDto(c.getId(), c.getName(), c.getDescription(), c.isActive(), c.getDisplayOrder());
    }
}
