package com.company.baseballshop.service;

import com.company.baseballshop.model.Product;
import com.company.baseballshop.repository.ProductRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
public class ProductService {

    private final ProductRepository productRepository;

    @Autowired
    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    /**
     * 모든 상품 조회
     * @return List<Product> - 모든 상품 목록
     */
    public List<Product> getAllProducts() {
        log.info("모든 상품 조회 요청");
        List<Product> products = productRepository.findAll();
        log.info("조회된 상품 수: {}", products.size());
        return products.stream()
                .map(this::calculateDiscountedPrice)
                .toList();
    }

    /**
     * 특정 ID의 상품 조회
     * @param id - 상품 ID
     * @return Product - 조회된 상품 또는 null
     */
    public Product getProductById(Long id) {
        log.info("상품 상세 조회 요청: {}", id);
        Optional<Product> product = productRepository.findById(id);
        if (product.isEmpty()) {
            log.warn("상품을 찾을 수 없습니다: {}", id);
            return null;
        }
        Product result = calculateDiscountedPrice(product.get());
        log.info("조회된 상품: {}", result.getName());
        return result;
    }

    /**
     * 카테고리별 상품 조회
     * @param category - 상품 카테고리
     * @return List<Product> - 카테고리별 상품 목록
     */
    public List<Product> getProductsByCategory(String category) {
        log.info("카테고리별 상품 조회 요청: {}", category);
        List<Product> products = productRepository.findByCategory(category);
        if (products.isEmpty()) {
            log.warn("해당 카테고리에 상품이 없습니다: {}", category);
        } else {
            log.info("조회된 상품 수: {}", products.size());
        }
        return products.stream()
                .map(this::calculateDiscountedPrice)
                .toList();
    }

    /**
     * 할인 상품 조회
     * @return List<Product> - 할인 상품 목록
     */
    public List<Product> getDiscountedProducts() {
        log.info("할인 상품 조회 요청");
        List<Product> discountedProducts = productRepository.findByIsDiscountedTrue();
        if (discountedProducts.isEmpty()) {
            log.warn("할인 상품이 없습니다.");
        } else {
            log.info("조회된 할인 상품 수: {}", discountedProducts.size());
        }
        return discountedProducts.stream()
                .map(this::calculateDiscountedPrice)
                .toList();
    }

    /**
     * 새로운 상품 생성
     * @param product - 생성할 상품 객체
     * @return Product - 저장된 상품
     */
    public Product createProduct(Product product) {
        log.info("새 상품 추가 요청: {}", product.getName());
        if (product.getName() == null || product.getName().trim().isEmpty()) {
            log.error("상품 이름이 비어 있습니다.");
            throw new IllegalArgumentException("상품 이름은 필수입니다.");
        }
        Product savedProduct = productRepository.save(calculateDiscountedPrice(product));
        log.info("상품 추가 성공: {}", savedProduct.getName());
        return savedProduct;
    }

    /**
     * 상품 수정
     * @param id - 수정할 상품 ID
     * @param newProduct - 수정할 상품 데이터
     * @return Product - 수정된 상품 또는 null
     */
    public Product updateProduct(Long id, Product newProduct) {
        log.info("상품 수정 요청: {}", id);
        Optional<Product> existingProduct = productRepository.findById(id);
        if (existingProduct.isEmpty()) {
            log.warn("수정할 상품을 찾을 수 없습니다: {}", id);
            return null;
        }

        Product product = existingProduct.get();
        product.setName(newProduct.getName());
        product.setDescription(newProduct.getDescription());
        product.setPrice(newProduct.getPrice());
        product.setOriginalPrice(newProduct.getOriginalPrice());
        product.setDiscountPercent(newProduct.getDiscountPercent());
        product.setStock(newProduct.getStock());
        product.setCategory(newProduct.getCategory());
        product.setImage(newProduct.getImage());
        product.setDiscounted(newProduct.isDiscounted());

        Product updatedProduct = productRepository.save(calculateDiscountedPrice(product));
        log.info("상품 수정 성공: {}", updatedProduct.getName());
        return updatedProduct;
    }

    /**
     * 상품 삭제
     * @param id - 삭제할 상품 ID
     */
    public void deleteProduct(Long id) {
        log.info("상품 삭제 요청: {}", id);
        Optional<Product> product = productRepository.findById(id);
        if (product.isEmpty()) {
            log.warn("삭제할 상품을 찾을 수 없습니다: {}", id);
            return;
        }
        productRepository.deleteById(id);
        log.info("상품 삭제 성공: {}", id);
    }

    /**
     * 할인 가격 계산
     * @param product - 계산할 상품
     * @return Product - 할인 적용된 상품
     */
    private Product calculateDiscountedPrice(Product product) {
        if (product.isDiscounted() && product.getOriginalPrice() != null && product.getDiscountPercent() != null) {
            int discountedPrice = (int) (product.getOriginalPrice() * (1 - product.getDiscountPercent() / 100.0));
            product.setPrice(discountedPrice);
            log.debug("할인 적용: 원래 가격={}, 할인율={}, 적용 가격={}", product.getOriginalPrice(), product.getDiscountPercent(), discountedPrice);
        }
        return product;
    }
}