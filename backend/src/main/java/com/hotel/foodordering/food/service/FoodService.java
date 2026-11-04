package com.hotel.foodordering.food.service;

import com.hotel.foodordering.category.entity.Category;
import com.hotel.foodordering.category.repository.CategoryRepository;
import com.hotel.foodordering.common.exception.ResourceNotFoundException;
import com.hotel.foodordering.food.dto.FoodItemDto;
import com.hotel.foodordering.food.dto.FoodItemRequest;
import com.hotel.foodordering.food.entity.FoodItem;
import com.hotel.foodordering.food.repository.FoodItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
@Service
@Transactional

public class FoodService {

    private final FoodItemRepository foodItemRepository;
    private final CategoryRepository categoryRepository;

    public FoodService(FoodItemRepository foodItemRepository, CategoryRepository categoryRepository) {
        this.foodItemRepository = foodItemRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<FoodItemDto> getAvailableFoods(Long categoryId, String search) {

        List<FoodItem> items;

        if (categoryId != null) {
            items = foodItemRepository.findAvailableByCategoryWithCategory(categoryId);
        } else if (search != null && !search.isBlank()) {
            items = foodItemRepository.findAvailableByNameWithCategory(search);
        } else {
            items = foodItemRepository.findAvailableWithCategory();
        }

        return items.stream().map(this::toDto).toList();
    }

    public FoodItemDto getById(Long id) {
        return toDto(
            foodItemRepository.findByIdWithCategory(id)
                .orElseThrow(() ->
                    new ResourceNotFoundException("Food item not found: " + id))
        );
}

    public List<FoodItemDto> getAllForAdmin() {
        return foodItemRepository.findAllWithCategory()
                .stream()
                .map(this::toDto)
                .toList();
    }

    public FoodItemDto create(FoodItemRequest request) {
        FoodItem item = new FoodItem();
        applyRequest(item, request);
        return toDto(foodItemRepository.save(item));
    }

    public FoodItemDto update(Long id, FoodItemRequest request) {
        FoodItem item = findFoodOrThrow(id);
        applyRequest(item, request);
        item.setUpdatedAt(LocalDateTime.now());
        return toDto(foodItemRepository.save(item));
    }

    public FoodItemDto setAvailability(Long id, boolean available) {
        FoodItem item = findFoodOrThrow(id);
        item.setAvailable(available);
        item.setUpdatedAt(LocalDateTime.now());
        return toDto(foodItemRepository.save(item));
    }

    public FoodItemDto updateImageUrl(Long id, String imageUrl) {
        FoodItem item = findFoodOrThrow(id);
        item.setImageUrl(imageUrl);
        item.setUpdatedAt(LocalDateTime.now());
        return toDto(foodItemRepository.save(item));
    }

    private FoodItem findFoodOrThrow(Long id) {
        return foodItemRepository.findByIdWithCategory(id)
                .orElseThrow(() ->
                    new ResourceNotFoundException("Food item not found: " + id));
    }

    private void applyRequest(FoodItem item, FoodItemRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + request.getCategoryId()));
        item.setCategory(category);
        item.setName(request.getName());
        item.setDescription(request.getDescription());
        item.setPrice(request.getPrice());
        if (request.getImageUrl() != null) {
            item.setImageUrl(request.getImageUrl());
        }
        item.setAvailable(request.isAvailable());
        item.setVeg(request.getVeg());
        item.setPreparationTimeMinutes(request.getPreparationTimeMinutes());
    }

    private FoodItemDto toDto(FoodItem item) {
        FoodItemDto dto = new FoodItemDto();
        dto.setId(item.getId());
        dto.setCategoryId(item.getCategory().getId());
        dto.setCategoryName(item.getCategory().getName());
        dto.setName(item.getName());
        dto.setDescription(item.getDescription());
        dto.setPrice(item.getPrice());
        dto.setImageUrl(item.getImageUrl());
        dto.setAvailable(item.isAvailable());
        dto.setVeg(item.getVeg());
        dto.setPreparationTimeMinutes(item.getPreparationTimeMinutes());
        return dto;
    }
}
