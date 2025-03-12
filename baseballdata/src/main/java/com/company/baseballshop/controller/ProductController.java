package com.company.baseballshop.controller;

import com.company.baseballshop.model.DiscountedProduct;
import com.company.baseballshop.model.Product;
import com.company.baseballshop.repository.DiscountedProductRepository;
import com.company.baseballshop.repository.ProductRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository productRepository;
    private final DiscountedProductRepository discountedProductRepository;

    public ProductController(ProductRepository productRepository, DiscountedProductRepository discountedProductRepository) {
        this.productRepository = productRepository;
        this.discountedProductRepository = discountedProductRepository;
    }

    // ✅ 전체 상품 가져오기
    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // ✅ 특정 카테고리 상품 가져오기
    @GetMapping("/category/{category}")
    public List<Product> getProductsByCategory(@PathVariable String category) {
        return productRepository.findByCategory(category);
    }

    // ✅ 할인 상품 가져오기
    @GetMapping("/discounted-products")
    public List<DiscountedProduct> getAllDiscountedProducts() {
        return discountedProductRepository.findAll();
    }
}