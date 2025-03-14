package com.company.baseballshop.controller;

import com.company.baseballshop.model.Product;
import com.company.baseballshop.service.ProductService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public ResponseEntity<List<Product>> getProductsByCategory(@PathVariable String category) {
        log.info("카테고리별 상품 조회 요청: {}", category);
        List<Product> products = productService.getProductsByCategory(category);
        return products.isEmpty()
                ? ResponseEntity.status(HttpStatus.NOT_FOUND).body(products)
                : ResponseEntity.ok(products);
    }

    @GetMapping("/discounted-products")
    public ResponseEntity<List<Product>> getDiscountedProducts() {
        log.info("할인 상품 조회 요청");
        List<Product> discountedProducts = productService.getDiscountedProducts();
        return discountedProducts.isEmpty()
                ? ResponseEntity.status(HttpStatus.NOT_FOUND).body(discountedProducts)
                : ResponseEntity.ok(discountedProducts);
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
}