package com.company.baseballshop.service;

import com.company.baseballshop.model.Product;
import com.company.baseballshop.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    @Transactional
    public Product createProduct(String name, String category, String brand, Integer price, Integer discountPrice, String imageUrl, String description, boolean isDiscounted, Integer discountPercent, Integer stock) {
        log.info("새 상품 생성 요청: name={}, category={}, brand={}", name, category, brand);

        // 필수 필드 검증
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("상품명은 필수 입력 항목입니다.");
        }
        if (category == null || category.trim().isEmpty()) {
            throw new IllegalArgumentException("카테고리는 필수 입력 항목입니다.");
        }
        if (brand == null || brand.trim().isEmpty()) {
            throw new IllegalArgumentException("브랜드는 필수 입력 항목입니다.");
        }
        if (price == null || price <= 0) {
            throw new IllegalArgumentException("가격은 0보다 커야 합니다.");
        }
        if (description == null || description.trim().isEmpty()) {
            throw new IllegalArgumentException("상품 설명은 필수 입력 항목입니다.");
        }
        if (stock == null || stock < 0) {
            throw new IllegalArgumentException("재고는 0 이상이어야 합니다.");
        }

        Product product = new Product();
        product.setName(name);
        product.setCategory(category);
        product.setBrand(brand);
        product.setPrice(price);
        product.setDiscountPrice(isDiscounted && discountPrice != null ? discountPrice : null);
        product.setDiscountPercent(isDiscounted ? discountPercent : null);
        product.setImageUrl(imageUrl != null ? imageUrl : ""); // image 필드가 NOT NULL이므로 기본값 설정
        product.setDescription(description);
        product.setDiscounted(isDiscounted);
        product.setStock(stock);

        return productRepository.save(product);
    }

    @Transactional
    public Product updateProduct(Long id, String name, String category, String brand, Integer price, Integer discountPrice, String imageUrl, String description, boolean isDiscounted, Integer discountPercent, Integer stock) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));

        // 필수 필드 검증
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("상품명은 필수 입력 항목입니다.");
        }
        if (category == null || category.trim().isEmpty()) {
            throw new IllegalArgumentException("카테고리는 필수 입력 항목입니다.");
        }
        if (brand == null || brand.trim().isEmpty()) {
            throw new IllegalArgumentException("브랜드는 필수 입력 항목입니다.");
        }
        if (price == null || price <= 0) {
            throw new IllegalArgumentException("가격은 0보다 커야 합니다.");
        }
        if (description == null || description.trim().isEmpty()) {
            throw new IllegalArgumentException("상품 설명은 필수 입력 항목입니다.");
        }
        if (stock == null || stock < 0) {
            throw new IllegalArgumentException("재고는 0 이상이어야 합니다.");
        }

        product.setName(name);
        product.setCategory(category);
        product.setBrand(brand);
        product.setPrice(price);
        product.setDiscountPrice(isDiscounted && discountPrice != null ? discountPrice : null);
        product.setDiscountPercent(isDiscounted ? discountPercent : null);
        product.setImageUrl(imageUrl != null ? imageUrl : product.getImageUrl());
        product.setDescription(description);
        product.setDiscounted(isDiscounted);
        product.setStock(stock);

        return productRepository.save(product);
    }

    @Transactional(readOnly = true)
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));
    }

    @Transactional(readOnly = true)
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Product> getProductsByCategory(String category) {
        return productRepository.findByCategory(category);
    }

    @Transactional(readOnly = true)
    public List<Product> getProductsByCategoryAndBrand(String category, String brand) {
        return productRepository.findByCategoryAndBrand(category, brand);
    }

    @Transactional(readOnly = true)
    public List<Product> getDiscountedProducts() {
        return productRepository.findByIsDiscountedTrue();
    }

    @Transactional(readOnly = true)
    public List<String> getDistinctBrands() {
        return productRepository.findDistinctBrands();
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));
        productRepository.delete(product);
    }


}