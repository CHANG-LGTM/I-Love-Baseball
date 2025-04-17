package com.company.baseballshop.controller;

import com.company.baseballshop.model.Review;
import com.company.baseballshop.model.ReviewComment;
import com.company.baseballshop.service.ReviewService;
import com.company.baseballshop.service.S3Service;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = {"http://localhost:5173", "https://baseball.teamace.shop"}, allowCredentials = "true")
public class ReviewController {

    private final ReviewService reviewService;
    private final S3Service s3Service;

    public ReviewController(ReviewService reviewService, S3Service s3Service) {
        this.reviewService = reviewService;
        this.s3Service = s3Service;
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<Review>> getAllReviews() {
        log.info("모든 리뷰 조회 요청");
        List<Review> reviews = reviewService.getAllReviews();
        return ResponseEntity.ok(reviews);
    }

    // 특정 리뷰 조회 (추가)
    @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Review> getReviewById(@PathVariable Long id) {
        log.info("리뷰 ID로 조회 요청: id={}", id);
        Review review = reviewService.getReviewById(id);
        return ResponseEntity.ok(review);
    }

    @GetMapping(value = "/my-reviews", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<Review>> getMyReviews(@AuthenticationPrincipal String customerId) {
        if (customerId == null) {
            log.warn("인증되지 않은 사용자가 /my-reviews에 접근 시도");
            return ResponseEntity.status(401).build();
        }
        log.info("사용자 {}의 리뷰 조회", customerId);
        List<Review> reviews = reviewService.getReviewsByNickname(customerId);
        return ResponseEntity.ok(reviews);
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<Review> createReview(
            @RequestParam("content") String content,
            @RequestParam(value = "productId", required = false) Long productId,
            @RequestParam("rating") Integer rating,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @AuthenticationPrincipal String customerId) throws IOException {
        if (customerId == null) {
            log.warn("인증되지 않은 사용자가 리뷰 생성 시도");
            return ResponseEntity.status(401).build();
        }

        if (content == null || content.trim().isEmpty() || productId == null || rating == null) {
            log.warn("필수 필드가 누락됨: content={}, productId={}, rating={}", content, productId, rating);
            return ResponseEntity.badRequest().build();
        }

        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            String fileName = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
            String key = customerId + "/reviews/" + productId + "/" + fileName;
            File tempFile = File.createTempFile("review", fileName);
            image.transferTo(tempFile);
            imageUrl = s3Service.uploadCustomerPhoto(key, tempFile);
            tempFile.delete();
        }

        Review review = reviewService.createReview(customerId, content, productId, imageUrl, rating);
        log.info("리뷰 생성 성공: id={}", review.getId());
        return ResponseEntity.status(201).body(review);
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<Review> updateReview(
            @PathVariable Long id,
            @RequestParam("content") String content,
            @RequestParam("rating") Integer rating,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @AuthenticationPrincipal String customerId) throws IOException {
        if (customerId == null) {
            log.warn("인증되지 않은 사용자가 리뷰 수정 시도: id={}", id);
            return ResponseEntity.status(401).build();
        }

        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            String fileName = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
            String key = customerId + "/reviews/" + id + "/" + fileName;
            File tempFile = File.createTempFile("review", fileName);
            image.transferTo(tempFile);
            imageUrl = s3Service.uploadCustomerPhoto(key, tempFile);
            tempFile.delete();

            // 기존 이미지 삭제 (필요 시)
            Review existingReview = reviewService.getReviewById(id);
            if (existingReview.getImageUrl() != null) {
                String existingKey = extractKeyFromUrl(existingReview.getImageUrl(), "teamace-customer-photos");
                if (existingKey != null) {
                    s3Service.deleteCustomerPhoto(existingKey);
                }
            }
        }

        try {
            Review updatedReview = reviewService.updateReview(id, customerId, content, rating, imageUrl);
            log.info("리뷰 수정 성공: id={}", id);
            return ResponseEntity.ok(updatedReview);
        } catch (IllegalArgumentException e) {
            log.warn("리뷰 수정 실패: id={}, error={}", id, e.getMessage());
            return ResponseEntity.status(403).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long id,
            @AuthenticationPrincipal String customerId) throws IOException {
        if (customerId == null) {
            log.warn("인증되지 않은 사용자가 리뷰 삭제 시도: id={}", id);
            return ResponseEntity.status(401).build();
        }

        try {
            // 리뷰 조회 및 이미지 삭제
            Review review = reviewService.getReviewById(id);
            if (review.getImageUrl() != null) {
                String key = extractKeyFromUrl(review.getImageUrl(), "teamace-customer-photos");
                if (key != null) {
                    s3Service.deleteCustomerPhoto(key);
                }
            }

            // 관리자 여부 확인
            boolean isAdmin = SecurityContextHolder.getContext().getAuthentication()
                    .getAuthorities().stream()
                    .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_ADMIN"));

            reviewService.deleteReview(id, customerId, isAdmin);
            log.info("리뷰 삭제 성공: id={}", id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            log.warn("리뷰 삭제 실패: id={}, error={}", id, e.getMessage());
            return ResponseEntity.status(403).build();
        }
    }

    @PostMapping("/{reviewId}/photo")
    public ResponseEntity<String> uploadReviewPhoto(
            @PathVariable Long reviewId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal String customerId) throws IOException {
        if (customerId == null) {
            log.warn("인증되지 않은 사용자가 리뷰 사진 업로드 시도: reviewId={}", reviewId);
            return ResponseEntity.status(401).build();
        }

        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        String key = customerId + "/reviews/" + reviewId + "/" + fileName;
        File tempFile = File.createTempFile("review", fileName);
        file.transferTo(tempFile);
        String photoUrl = s3Service.uploadCustomerPhoto(key, tempFile);
        tempFile.delete();

        // 리뷰에 사진 URL 업데이트
        reviewService.updateReviewPhoto(reviewId, customerId, photoUrl);

        return ResponseEntity.ok(photoUrl);
    }

    @DeleteMapping("/{reviewId}/photo")
    public ResponseEntity<Void> deleteReviewPhoto(
            @PathVariable Long reviewId,
            @RequestParam("key") String key,
            @AuthenticationPrincipal String customerId) {
        if (customerId == null) {
            log.warn("인증되지 않은 사용자가 리뷰 사진 삭제 시도: reviewId={}", reviewId);
            return ResponseEntity.status(401).build();
        }

        if (!key.startsWith(customerId + "/")) {
            log.warn("사용자가 소유하지 않은 사진 삭제 시도: customerId={}, key={}", customerId, key);
            return ResponseEntity.status(403).build();
        }

        s3Service.deleteCustomerPhoto(key);
        reviewService.updateReviewPhoto(reviewId, customerId, null);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<ReviewComment> addComment(
            @PathVariable Long id,
            @RequestBody CommentRequest body,
            @AuthenticationPrincipal String customerId) {
        if (customerId == null) {
            log.warn("인증되지 않은 사용자가 댓글 추가 시도: reviewId={}", id);
            return ResponseEntity.status(401).build();
        }

        ReviewComment comment = reviewService.addComment(id, body.content(), customerId);
        log.info("댓글 추가 성공: reviewId={}, commentId={}", id, comment.getId());
        return ResponseEntity.status(201).body(comment);
    }

    private String extractKeyFromUrl(String imageUrl, String bucketName) {
        String prefix = "https://s3.ap-northeast-1.amazonaws.com/" + bucketName + "/";
        if (imageUrl != null && imageUrl.startsWith(prefix)) {
            return imageUrl.substring(prefix.length());
        }
        return null;
    }

    record DeleteRequest(String nickname, Boolean isAdmin) {}
    record CommentRequest(String content) {}
}