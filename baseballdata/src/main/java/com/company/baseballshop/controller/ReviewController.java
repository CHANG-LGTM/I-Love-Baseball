package com.company.baseballshop.controller;

import com.company.baseballshop.model.Review;
import com.company.baseballshop.model.ReviewComment;
import com.company.baseballshop.service.ReviewService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.Principal;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class ReviewController {
    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public List<Review> getAllReviews() {
        return reviewService.getAllReviews();
    }

    @GetMapping(value = "/my-reviews", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<Review>> getMyReviews(Principal principal) {
        if (principal == null) {
            log.warn("인증되지 않은 사용자가 /my-reviews에 접근 시도");
            return ResponseEntity.status(401).build();
        }
        String nickname = principal.getName();
        log.info("사용자 {}의 리뷰 조회", nickname);
        List<Review> reviews = reviewService.getReviewsByNickname(nickname);
        return ResponseEntity.ok(reviews);
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<Review> createReview(
            @RequestParam("content") String content,
            @RequestParam("productId") Long productId,
            @RequestParam("rating") Integer rating,
            @RequestParam(value = "image", required = false) MultipartFile image,
            Principal principal) throws IOException {
        if (principal == null) {
            log.warn("인증되지 않은 사용자가 리뷰 생성 시도");
            return ResponseEntity.status(401).build();
        }

        String nickname = principal.getName();
        if (content == null || productId == null || rating == null) {
            log.warn("필수 필드가 누락됨: content={}, productId={}, rating={}", content, productId, rating);
            return ResponseEntity.badRequest().build();
        }

        Review review = reviewService.createReview(nickname, content, productId, image, rating);
        log.info("리뷰 생성 성공: id={}", review.getId());
        return ResponseEntity.status(201).body(review);
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<Review> updateReview(
            @PathVariable Long id,
            @RequestParam("nickname") String nickname,
            @RequestParam("content") String content,
            @RequestParam(value = "image", required = false) MultipartFile image) throws IOException {
        try {
            Review updatedReview = reviewService.updateReview(id, nickname, content, image);
            log.info("리뷰 수정 성공: id={}", id);
            return ResponseEntity.ok(updatedReview);
        } catch (IllegalArgumentException e) {
            log.warn("리뷰 수정 실패: id={}, error={}", id, e.getMessage());
            return ResponseEntity.status(403).body(null);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long id,
            @RequestBody DeleteRequest body) throws IOException {
        String nickname = body.nickname();
        Boolean isAdmin = body.isAdmin();
        try {
            reviewService.deleteReview(id, nickname, isAdmin != null && isAdmin);
            log.info("리뷰 삭제 성공: id={}", id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            log.warn("리뷰 삭제 실패: id={}, error={}", id, e.getMessage());
            return ResponseEntity.status(403).build();
        }
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<ReviewComment> addComment(
            @PathVariable Long id,
            @RequestBody CommentRequest body) {
        ReviewComment comment = reviewService.addComment(id, body.content());
        log.info("댓글 추가 성공: reviewId={}, commentId={}", id, comment.getId());
        return ResponseEntity.status(201).body(comment);
    }

    record DeleteRequest(String nickname, Boolean isAdmin) {}
    record CommentRequest(String content) {}
}       