package com.company.baseballshop.repository;

import com.company.baseballshop.model.DiscountedProduct;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DiscountedProductRepository extends JpaRepository<DiscountedProduct, Long> {
}
