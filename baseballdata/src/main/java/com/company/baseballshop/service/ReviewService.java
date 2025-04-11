package com.company.baseballshop.service;

import com.company.baseballshop.model.Product;
import com.company.baseballshop.model.Review;
import com.company.baseballshop.model.ReviewComment;
import com.company.baseballshop.repository.ReviewCommentRepository;
import com.company.baseballshop.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReviewCommentRepository reviewCommentRepository;

    public List<Review> getReviewsByNickname(String nickname) {
        log.info("닉네임으로 리뷰 조회: nickname={}", nickname);
        List<Review> reviews = reviewRepository.findByNickname(nickname);
        if (reviews.isEmpty()) {
            log.warn("해당 사용자의 리뷰가 존재하지 않음: nickname={}", nickname);
        }
        return reviews;
    }

    public List<Review> getAllReviews() {
        log.info("모든 리뷰 조회 요청");
        return reviewRepository.findAll();
    }

    public Review getReviewById(Long id) {
        log.info("리뷰 조회: id={}", id);
        return reviewRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다: id=" + id));
    }

    public Review createReview(String nickname, String content, Long productId, String imageUrl, Integer rating) {
        log.info("리뷰 생성 요청: nickname={}, productId={}, rating={}", nickname, productId, rating);

        Review review = new Review();
        review.setNickname(nickname);
        review.setContent(content);
        review.setRating(rating);
        Product product = new Product();
        product.setId(productId);
        review.setProduct(product);
        review.setImageUrl(imageUrl);

        Review savedReview = reviewRepository.save(review);
        log.info("리뷰 생성 성공: id={}", savedReview.getId());
        return savedReview;
    }

    public Review updateReview(Long id, String nickname, String content, Integer rating, String imageUrl) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다."));
        if (!review.getNickname().equals(nickname)) {
            throw new IllegalArgumentException("본인이 작성한 리뷰만 수정할 수 있습니다.");
        }
        review.setContent(content);
        review.setRating(rating);
        review.setUpdatedAt(LocalDateTime.now());
        if (imageUrl != null) {
            review.setImageUrl(imageUrl);
        }
        return reviewRepository.save(review);
    }

    public void deleteReview(Long id, String nickname, boolean isAdmin) {
        log.info("리뷰 삭제 요청: id={}, nickname={}, isAdmin={}", id, nickname, isAdmin);

        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다: id=" + id));
        if (!isAdmin && !review.getNickname().equals(nickname)) {
            log.warn("권한 없음: 리뷰 작성자={}, 요청 사용자={}", review.getNickname(), nickname);
            throw new IllegalArgumentException("본인이 작성한 리뷰이거나 관리자만 삭제할 수 있습니다.");
        }

        reviewRepository.deleteById(id);
        log.info("리뷰 삭제 성공: id={}", id);
    }

    public void updateReviewPhoto(Long reviewId, String customerId, String photoUrl) {
        log.info("리뷰 사진 업데이트: reviewId={}, customerId={}", reviewId, customerId);

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다: id=" + reviewId));
        if (!review.getNickname().equals(customerId)) {
            log.warn("리뷰 작성자 불일치: 리뷰 작성자={}, 요청 사용자={}", review.getNickname(), customerId);
            throw new IllegalArgumentException("리뷰 작성자만 사진을 수정할 수 있습니다.");
        }

        review.setImageUrl(photoUrl);
        reviewRepository.save(review);
        log.info("리뷰 사진 업데이트 성공: reviewId={}", reviewId);
    }

    public ReviewComment addComment(Long reviewId, String content, String userEmail) {
        log.info("댓글 추가 요청: reviewId={}, customerId={}", reviewId);

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다: id=" + reviewId));

        ReviewComment comment = new ReviewComment();
        comment.setReview(review);
        comment.setContent(content);
        comment.setUserEmail(userEmail);
        return reviewCommentRepository.save(comment);
    }
}