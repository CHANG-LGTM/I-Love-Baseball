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

    @Autowired
    private ProductRepository productRepository;

    public List<Product> getAllProducts() {
        log.info("모든 상품 조회");
        return productRepository.findAll();
    }

    public List<Product> getProductsByCategory(String category) {
        log.info("카테고리별 상품 조회: category={}", category);
        List<Product> products = productRepository.findByCategory(category);
        log.info("조회된 상품 수: {}", products.size());
        applyDiscounts(products);
        return products;
    }

    public List<Product> getProductsByCategoryAndBrand(String category, String brand) {
        log.info("카테고리와 브랜드로 상품 조회: category={}, brand={}", category, brand);
        List<Product> products = productRepository.findByCategoryAndBrand(category, brand);
        log.info("조회된 상품 수: {}", products.size());
        applyDiscounts(products);
        return products;
    }

    public List<Product> getDiscountedProducts() {
        log.info("할인 상품 조회");
        List<Product> products = productRepository.findByIsDiscountedTrue();
        applyDiscounts(products);
        return products;
    }

    public Product getProductById(Long id) {
        log.info("상품 상세 조회: id={}", id);
        Optional<Product> product = productRepository.findById(id);
        if (product.isPresent()) {
            Product p = product.get();
            applyDiscount(p);
            return p;
        }
        return null;
    }

    public Product createProduct(Product product) {
        log.info("새 상품 생성: name={}", product.getName());
        if (product.getName() == null || product.getName().isEmpty()) {
            throw new IllegalArgumentException("상품 이름은 필수입니다.");
        }
        return productRepository.save(product);
    }

    public Product updateProduct(Long id, Product productDetails) {
        log.info("상품 수정: id={}", id);
        Optional<Product> productOptional = productRepository.findById(id);
        if (productOptional.isPresent()) {
            Product product = productOptional.get();
            product.setName(productDetails.getName());
            product.setDescription(productDetails.getDescription());
            product.setPrice(productDetails.getPrice());
            product.setOriginalPrice(productDetails.getOriginalPrice());
            product.setDiscountPercent(productDetails.getDiscountPercent());
            product.setStock(productDetails.getStock());
            product.setCategory(productDetails.getCategory());
            product.setImage(productDetails.getImage());
            product.setDiscounted(productDetails.isDiscounted());
            product.setBrand(productDetails.getBrand());
            return productRepository.save(product);
        }
        return null;
    }

    public void deleteProduct(Long id) {
        log.info("상품 삭제: id={}", id);
        productRepository.deleteById(id);
    }

    public List<String> getDistinctBrands() {
        log.info("모든 브랜드 조회");
        return productRepository.findDistinctBrands();
    }

    private void applyDiscounts(List<Product> products) {
        for (Product product : products) {
            applyDiscount(product);
        }
    }

    private void applyDiscount(Product product) {
        if (product.isDiscounted() && product.getOriginalPrice() != null && product.getDiscountPercent() != null) {
            int discountedPrice = (int) (product.getOriginalPrice() * (1 - product.getDiscountPercent() / 100.0));
            log.debug("할인 적용: 원래 가격={}, 할인율={}, 적용 가격={}",
                    product.getOriginalPrice(), product.getDiscountPercent(), discountedPrice);
            product.setPrice(discountedPrice);
        }
    }
}