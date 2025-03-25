package com.company.baseballshop.controller;

import com.company.baseballshop.model.Product;
import com.company.baseballshop.service.ProductService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        log.info("모든 상품 조회 요청");
        List<Product> products = productService.getAllProducts();
        return ResponseEntity.ok(products);
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Product>> getProductsByCategory(
            @PathVariable String category,
            @RequestParam(required = false) String brand) {
        log.info("카테고리별 상품 조회 요청: category={}, brand={}", category, brand);
        List<Product> products;
        if (brand != null && !brand.isEmpty()) {
            products = productService.getProductsByCategoryAndBrand(category, brand);
        } else {
            products = productService.getProductsByCategory(category);
        }
        // 상품이 없어도 빈 배열 반환
        return ResponseEntity.ok(products != null ? products : Collections.emptyList());
    }

    @GetMapping("/discounted-products")
    public ResponseEntity<List<Product>> getDiscountedProducts() {
        log.info("할인 상품 조회 요청");
        List<Product> discountedProducts = productService.getDiscountedProducts();
        return ResponseEntity.ok(discountedProducts != null ? discountedProducts : Collections.emptyList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        log.info("상품 상세 조회 요청: {}", id);
        Product product = productService.getProductById(id);
        return product != null
                ? ResponseEntity.ok(product)
                : ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    @PostMapping
    public ResponseEntity<Product> addProduct(@RequestBody Product product) {
        log.info("새 상품 추가 요청: {}", product.getName());
        try {
            Product savedProduct = productService.createProduct(product);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedProduct);
        } catch (IllegalArgumentException e) {
            log.error("상품 추가 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product productDetails) {
        Product updatedProduct = productService.updateProduct(id, productDetails);
        return updatedProduct != null
                ? ResponseEntity.ok(updatedProduct)
                : ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        log.info("상품 삭제 요청: {}", id);
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/brands/{category}")
    public ResponseEntity<List<Map<String, Object>>> getBrandsByCategory(@PathVariable String category) {
        log.info("카테고리별 브랜드 조회 요청: category={}", category);
        try {
            List<Product> products = productService.getProductsByCategory(category);
            List<Map<String, Object>> brandCounts = products.stream()
                    .collect(Collectors.groupingBy(Product::getBrand, Collectors.counting()))
                    .entrySet().stream()
                    .map(entry -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("brand", entry.getKey());
                        map.put("count", entry.getValue());
                        return map;
                    })
                    .collect(Collectors.toList());
            return ResponseEntity.ok(brandCounts);
        } catch (Exception e) {
            log.error("브랜드 목록 조회 실패: category={}, error={}", category, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/brands")
    public ResponseEntity<List<String>> getAllBrands() {
        log.info("모든 브랜드 조회 요청");
        try {
            List<String> brands = productService.getDistinctBrands();
            return ResponseEntity.ok(brands);
        } catch (Exception e) {
            log.error("모든 브랜드 조회 실패: error={}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}