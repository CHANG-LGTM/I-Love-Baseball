package com.company.baseballshop.controller;

import com.company.baseballshop.model.Product;
import com.company.baseballshop.service.ProductService;
import com.company.baseballshop.service.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
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

@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminProductController {

    private final ProductService productService;
    private final S3Service s3Service;

    @GetMapping("/products")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Product>> getProducts(
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "brand", required = false) String brand) {
        log.info("관리자: 상품 조회 요청: category={}, brand={}", category, brand);
        List<Product> products;
        if (category != null && !category.isEmpty()) {
            if (brand != null && !brand.isEmpty()) {
                products = productService.getProductsByCategoryAndBrand(category, brand);
            } else {
                products = productService.getProductsByCategory(category);
            }
        } else {
            products = productService.getAllProducts();
        }
        return ResponseEntity.ok(products != null ? products : Collections.emptyList());
    }

    @GetMapping("/discounted-products")
    public ResponseEntity<List<Product>> getDiscountedProducts() {
        log.info("할인 상품 조회 요청");
        List<Product> discountedProducts = productService.getDiscountedProducts();
        return ResponseEntity.ok(discountedProducts != null ? discountedProducts : Collections.emptyList());
    }

    @GetMapping("/products/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        log.info("관리자: 상품 상세 조회 요청: {}", id);
        Product product = productService.getProductById(id);
        return product != null
                ? ResponseEntity.ok(product)
                : ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    @PostMapping(value = "/products", consumes = {"multipart/form-data"})
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> addProduct(
            @RequestParam("name") String name,
            @RequestParam("category") String category,
            @RequestParam("brand") String brand,
            @RequestParam("price") Integer price,
            @RequestParam(value = "discountPrice", required = false) Integer discountPrice,
            @RequestParam(value = "discountPercent", required = false) Integer discountPercent,
            @RequestParam(value = "image", required = true) MultipartFile image, // 이미지를 필수로 변경
            @RequestParam("description") String description,
            @RequestParam("discounted") boolean isDiscounted,
            @RequestParam("stock") Integer stock,
            @AuthenticationPrincipal String adminId) throws IOException {
        log.info("관리자: 새 상품 추가 요청: name={}", name);
        if (adminId == null) {
            log.warn("인증되지 않은 사용자가 상품 생성 시도");
            return ResponseEntity.status(401).build();
        }

        // 필수 필드 검증
        if (name == null || name.trim().isEmpty()) {
            log.warn("상품명이 누락됨: name={}", name);
            return ResponseEntity.badRequest().body(Map.of("error", "상품명은 필수 입력 항목입니다."));
        }
        if (category == null || category.trim().isEmpty()) {
            log.warn("카테고리가 누락됨: category={}", category);
            return ResponseEntity.badRequest().body(Map.of("error", "카테고리는 필수 입력 항목입니다."));
        }
        if (brand == null || brand.trim().isEmpty()) {
            log.warn("브랜드가 누락됨: brand={}", brand);
            return ResponseEntity.badRequest().body(Map.of("error", "브랜드는 필수 입력 항목입니다."));
        }
        if (price == null || price <= 0) {
            log.warn("가격이 잘못됨: price={}", price);
            return ResponseEntity.badRequest().body(Map.of("error", "가격은 0보다 커야 합니다."));
        }
        if (description == null || description.trim().isEmpty()) {
            log.warn("설명이 누락됨: description={}", description);
            return ResponseEntity.badRequest().body(Map.of("error", "상품 설명은 필수 입력 항목입니다."));
        }
        if (stock == null || stock < 0) {
            log.warn("재고가 잘못됨: stock={}", stock);
            return ResponseEntity.badRequest().body(Map.of("error", "재고는 0 이상이어야 합니다."));
        }
        if (image == null || image.isEmpty()) {
            log.warn("이미지가 누락됨");
            return ResponseEntity.badRequest().body(Map.of("error", "이미지는 필수 입력 항목입니다."));
        }

        // 이미지 업로드 처리
        String imageUrl;
        if (image.getSize() > 5 * 1024 * 1024) {
            log.warn("파일 크기 초과: size={}", image.getSize());
            return ResponseEntity.badRequest().body(Map.of("error", "파일 크기는 5MB를 초과할 수 없습니다."));
        }

        String contentType = image.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            log.warn("이미지 파일이 아님: contentType={}", contentType);
            return ResponseEntity.badRequest().body(Map.of("error", "이미지 파일만 업로드 가능합니다."));
        }

        String fileName = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
        String key = "products/" + fileName;
        File tempFile = File.createTempFile("product", fileName);
        image.transferTo(tempFile);
        imageUrl = s3Service.uploadProductPhoto(key, tempFile);
        tempFile.delete();

        // 할인 정보 처리
        Integer originalPrice = null;
        Integer finalPrice = price;
        Integer finalDiscountPercent = discountPercent;

        if (isDiscounted) {
            if (discountPrice != null && discountPrice > 0) {
                originalPrice = price; // 원래 가격을 originalPrice로 설정
                finalPrice = discountPrice; // 할인된 가격을 price로 설정
                if (discountPercent == null) {
                    // 할인율 계산: (원래 가격 - 할인된 가격) / 원래 가격 * 100
                    finalDiscountPercent = Math.round(((float)(originalPrice - finalPrice) / originalPrice) * 100);
                }
            } else if (discountPercent != null && discountPercent > 0) {
                originalPrice = price; // 원래 가격을 originalPrice로 설정
                finalPrice = Math.round(price * (100 - discountPercent) / 100f); // 할인된 가격 계산
            } else {
                log.warn("할인 정보가 잘못됨: discountPrice={}, discountPercent={}", discountPrice, discountPercent);
                return ResponseEntity.badRequest().body(Map.of("error", "할인 상품은 할인 가격 또는 할인율을 입력해야 합니다."));
            }
        }

        try {
            Product savedProduct = productService.createProduct(
                    name, category, brand, finalPrice, originalPrice, imageUrl, description, isDiscounted, finalDiscountPercent, stock);
            log.info("관리자: 상품 생성 성공: id={}", savedProduct.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(savedProduct);
        } catch (DataIntegrityViolationException e) {
            log.error("관리자: 상품 추가 실패 - 데이터베이스 제약 조건 위반: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", "상품 정보를 저장할 수 없습니다. 필수 필드를 확인해주세요."));
        } catch (IllegalArgumentException e) {
            log.error("관리자: 상품 추가 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping(value = "/products/{id}", consumes = {"multipart/form-data"})
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateProduct(
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
        log.info("관리자: 상품 수정 요청: id={}, name={}", id, name);
        if (adminId == null) {
            log.warn("인증되지 않은 사용자가 상품 수정 시도: id={}", id);
            return ResponseEntity.status(401).build();
        }

        // 필수 필드 검증
        if (name == null || name.trim().isEmpty()) {
            log.warn("상품명이 누락됨: name={}", name);
            return ResponseEntity.badRequest().body(Map.of("error", "상품명은 필수 입력 항목입니다."));
        }
        if (category == null || category.trim().isEmpty()) {
            log.warn("카테고리가 누락됨: category={}", category);
            return ResponseEntity.badRequest().body(Map.of("error", "카테고리는 필수 입력 항목입니다."));
        }
        if (brand == null || brand.trim().isEmpty()) {
            log.warn("브랜드가 누락됨: brand={}", brand);
            return ResponseEntity.badRequest().body(Map.of("error", "브랜드는 필수 입력 항목입니다."));
        }
        if (price == null || price <= 0) {
            log.warn("가격이 잘못됨: price={}", price);
            return ResponseEntity.badRequest().body(Map.of("error", "가격은 0보다 커야 합니다."));
        }
        if (description == null || description.trim().isEmpty()) {
            log.warn("설명이 누락됨: description={}", description);
            return ResponseEntity.badRequest().body(Map.of("error", "상품 설명은 필수 입력 항목입니다."));
        }
        if (stock == null || stock < 0) {
            log.warn("재고가 잘못됨: stock={}", stock);
            return ResponseEntity.badRequest().body(Map.of("error", "재고는 0 이상이어야 합니다."));
        }

        // 이미지 처리
        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            if (image.getSize() > 5 * 1024 * 1024) {
                log.warn("파일 크기 초과: size={}", image.getSize());
                return ResponseEntity.badRequest().body(Map.of("error", "파일 크기는 5MB를 초과할 수 없습니다."));
            }

            String contentType = image.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                log.warn("이미지 파일이 아님: contentType={}", contentType);
                return ResponseEntity.badRequest().body(Map.of("error", "이미지 파일만 업로드 가능합니다."));
            }

            String fileName = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
            String key = "products/" + id + "/" + fileName;
            File tempFile = File.createTempFile("product", fileName);
            image.transferTo(tempFile);
            imageUrl = s3Service.uploadProductPhoto(key, tempFile);
            tempFile.delete();

            Product existingProduct = productService.getProductById(id);
            if (existingProduct != null && existingProduct.getImageUrl() != null) {
                String existingKey = extractKeyFromUrl(existingProduct.getImageUrl(), "teamace-product-photos");
                if (existingKey != null) {
                    s3Service.deleteProductPhoto(existingKey);
                }
            }
        }

        // 할인 정보 처리
        Integer originalPrice = null;
        Integer finalPrice = price;
        Integer finalDiscountPercent = discountPercent;

        if (isDiscounted) {
            if (discountPrice != null && discountPrice > 0) {
                originalPrice = price;
                finalPrice = discountPrice;
                if (discountPercent == null) {
                    finalDiscountPercent = Math.round(((float)(originalPrice - finalPrice) / originalPrice) * 100);
                }
            } else if (discountPercent != null && discountPercent > 0) {
                originalPrice = price;
                finalPrice = Math.round(price * (100 - discountPercent) / 100f);
            } else {
                log.warn("할인 정보가 잘못됨: discountPrice={}, discountPercent={}", discountPrice, discountPercent);
                return ResponseEntity.badRequest().body(Map.of("error", "할인 상품은 할인 가격 또는 할인율을 입력해야 합니다."));
            }
        }

        try {
            Product updatedProduct = productService.updateProduct(
                    id, name, category, brand, finalPrice, originalPrice, imageUrl, description, isDiscounted, finalDiscountPercent, stock);
            log.info("관리자: 상품 수정 성공: id={}", id);
            return ResponseEntity.ok(updatedProduct);
        } catch (DataIntegrityViolationException e) {
            log.error("관리자: 상품 수정 실패 - 데이터베이스 제약 조건 위반: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", "상품 정보를 수정할 수 없습니다. 필수 필드를 확인해주세요."));
        }
    }

    @DeleteMapping("/products/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Long id,
            @AuthenticationPrincipal String adminId) {
        log.info("관리자: 상품 삭제 요청: id={}", id);
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
        log.info("관리자: 상품 삭제 성공: id={}", id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/uploads")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal String adminId) {
        log.info("관리자: 파일 업로드 요청: filename={}", file.getOriginalFilename());
        if (adminId == null) {
            log.warn("인증되지 않은 사용자가 파일 업로드 시도");
            return ResponseEntity.status(401).build();
        }

        try {
            if (file.isEmpty()) {
                log.warn("파일이 비어 있음");
                throw new IllegalArgumentException("파일이 비어 있습니다.");
            }

            String originalFileName = file.getOriginalFilename();
            if (originalFileName == null || originalFileName.isEmpty()) {
                log.warn("파일 이름이 없음");
                throw new IllegalArgumentException("파일 이름이 없습니다.");
            }

            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                log.warn("이미지 파일이 아님: contentType={}", contentType);
                throw new IllegalArgumentException("이미지 파일만 업로드 가능합니다.");
            }

            long maxFileSize = 5 * 1024 * 1024;
            if (file.getSize() > maxFileSize) {
                log.warn("파일 크기 초과: size={}", file.getSize());
                throw new IllegalArgumentException("파일 크기는 5MB를 초과할 수 없습니다.");
            }

            String fileName = UUID.randomUUID().toString() + "_" + originalFileName;
            String key = "products/" + fileName;
            File tempFile = File.createTempFile("upload", fileName);
            file.transferTo(tempFile);
            String fileUrl = s3Service.uploadProductPhoto(key, tempFile);
            tempFile.delete();

            Map<String, String> response = new HashMap<>();
            response.put("url", fileUrl);
            log.info("파일 업로드 성공: url={}", fileUrl);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            log.error("파일 업로드 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "파일 업로드 실패: " + e.getMessage()));
        } catch (IllegalArgumentException e) {
            log.error("파일 업로드 실패: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("파일 업로드 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "서버 오류: " + e.getMessage()));
        }
    }

    private String extractKeyFromUrl(String imageUrl, String bucketName) {
        String prefix = "https://s3.ap-northeast-2.amazonaws.com/" + bucketName + "/";
        if (imageUrl != null && imageUrl.startsWith(prefix)) {
            return imageUrl.substring(prefix.length());
        }
        return null;
    }
}