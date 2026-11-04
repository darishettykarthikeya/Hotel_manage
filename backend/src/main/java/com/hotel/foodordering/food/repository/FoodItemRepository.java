
package com.hotel.foodordering.food.repository;

import com.hotel.foodordering.food.entity.FoodItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FoodItemRepository extends JpaRepository<FoodItem, Long> {

    @Query("SELECT f FROM FoodItem f JOIN FETCH f.category WHERE f.available = true")
    List<FoodItem> findAvailableWithCategory();

    @Query("SELECT f FROM FoodItem f JOIN FETCH f.category WHERE f.category.id = :categoryId AND f.available = true")
    List<FoodItem> findAvailableByCategoryWithCategory(@Param("categoryId") Long categoryId);

    @Query("SELECT f FROM FoodItem f JOIN FETCH f.category WHERE LOWER(f.name) LIKE LOWER(CONCAT('%', :name, '%')) AND f.available = true")
    List<FoodItem> findAvailableByNameWithCategory(@Param("name") String name);

    @Query("SELECT f FROM FoodItem f JOIN FETCH f.category")
    List<FoodItem> findAllWithCategory();

    @Query("SELECT f FROM FoodItem f JOIN FETCH f.category WHERE f.id = :id")
    Optional<FoodItem> findByIdWithCategory(@Param("id") Long id);
}
