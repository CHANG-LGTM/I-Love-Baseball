package com.company.baseballshop.controller;

import com.company.baseballshop.model.Product;
import com.company.baseballshop.service.ProductService;
import com.company.baseballshop.service.S3Service;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;
    private final S3Service s3Service;

    public ProductController(ProductService productService, S3Service s3Service) {
        this.productService = productService;
        this.s3Service = s3Service;
    }

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

    @PostMapping(consumes = {"multipart/form-data"})
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Product> createProduct(
            @RequestParam("name") String name,
            @RequestParam("category") String category,
            @RequestParam("brand") String brand,
            @RequestParam("price") Integer price,
            @RequestParam(value = "discountPrice", required = false) Integer discountPrice,
            @RequestParam(value = "discountPercent", required = false) Integer discountPercent,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam("description") String description,
            @RequestParam("discounted") boolean isDiscounted,
            @RequestParam("stock") Integer stock,
            @AuthenticationPrincipal String adminId) throws IOException {
        if (adminId == null) {
            log.warn("인증되지 않은 사용자가 상품 생성 시도");
            return ResponseEntity.status(401).build();
        }

        if (name == null || name.trim().isEmpty() || category == null || category.trim().isEmpty() ||
                brand == null || brand.trim().isEmpty() || price == null || price <= 0 ||
                description == null || description.trim().isEmpty() || stock == null || stock < 0) {
            log.warn("필수 필드가 누락됨: name={}, category={}, brand={}, price={}, description={}, stock={}",
                    name, category, brand, price, description, stock);
            return ResponseEntity.badRequest().build();
        }

        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            String fileName = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
            String key = "products/" + fileName;
            File tempFile = File.createTempFile("product", fileName);
            image.transferTo(tempFile);
            imageUrl = s3Service.uploadProductPhoto(key, tempFile);
            tempFile.delete();
        }

        Product product = productService.createProduct(
                name, category, brand, price, discountPrice, imageUrl, description, isDiscounted, discountPercent, stock);
        log.info("상품 생성 성공: id={}", product.getId());
        return ResponseEntity.status(201).body(product);
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Product> updateProduct(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam("category") String category,
            @RequestParam("brand") String brand,
            @RequestParam("price") Integer price,
            @RequestParam(value = "discountPrice", required = false) Integer discountPrice,
            @RequestParam(value = "discountPercent", required = false) Integer discountPercent,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam("description") String description,
            @RequestParam("discounted") boolean isDiscounted,
            @RequestParam("stock") Integer stock,
            @AuthenticationPrincipal String adminId) throws IOException {
        if (adminId == null) {
            log.warn("인증되지 않은 사용자가 상품 수정 시도: id={}", id);
            return ResponseEntity.status(401).build();
        }

        if (name == null || name.trim().isEmpty() || category == null || category.trim().isEmpty() ||
                brand == null || brand.trim().isEmpty() || price == null || price <= 0 ||
                description == null || description.trim().isEmpty() || stock == null || stock < 0) {
            log.warn("필수 필드가 누락됨: name={}, category={}, brand={}, price={}, description={}, stock={}",
                    name, category, brand, price, description, stock);
            return ResponseEntity.badRequest().build();
        }

        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            String fileName = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
            String key = "products/" + id + "/" + fileName;
            File tempFile = File.createTempFile("product", fileName);
            image.transferTo(tempFile);
            imageUrl = s3Service.uploadProductPhoto(key, tempFile);
            tempFile.delete();

            // 기존 이미지 삭제
            Product existingProduct = productService.getProductById(id);
            if (existingProduct != null && existingProduct.getImageUrl() != null) {
                String existingKey = extractKeyFromUrl(existingProduct.getImageUrl(), "teamace-product-photos");
                if (existingKey != null) {
                    s3Service.deleteProductPhoto(existingKey);
                }
            }
        }

        Product updatedProduct = productService.updateProduct(
                id, name, category, brand, price, discountPrice, imageUrl, description, isDiscounted, discountPercent, stock);
        log.info("상품 수정 성공: id={}", id);
        return ResponseEntity.ok(updatedProduct);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Long id,
            @AuthenticationPrincipal String adminId) {
        if (adminId == null) {
            log.warn("인증되지 않은 사용자가 상품 삭제 시도: id={}", id);
            return ResponseEntity.status(401).build();
        }

        Product product = productService.getProductById(id);
        if (product == null) {
            log.warn("존재하지 않는 상품 삭제 시도: id={}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        if (product.getImageUrl() != null) {
            String key = extractKeyFromUrl(product.getImageUrl(), "teamace-product-photos");
            if (key != null) {
                s3Service.deleteProductPhoto(key);
            }
        }

        productService.deleteProduct(id);
        log.info("상품 삭제 성공: id={}", id);
        return ResponseEntity.ok().build();
    }

    // S3 URL에서 키 추출하는 유틸리티 메서드
    private String extractKeyFromUrl(String imageUrl, String bucketName) {
        String prefix = "https://s3.ap-northeast-1.amazonaws.com/" + bucketName + "/";
        if (imageUrl != null && imageUrl.startsWith(prefix)) {
            return imageUrl.substring(prefix.length());
        }
        return null;
    }
}