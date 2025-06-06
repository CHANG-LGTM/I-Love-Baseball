package com.company.baseballshop.repository;

import com.company.baseballshop.model.CartItem;
import com.company.baseballshop.model.Product;
import com.company.baseballshop.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUser(User user);
    Optional<CartItem> findByUserAndProduct(User user, Product product);
}