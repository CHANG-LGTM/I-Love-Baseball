package com.company.baseballshop.service;

import com.company.baseballshop.model.Product;
import com.company.baseballshop.model.Review;
import com.company.baseballshop.model.ReviewComment;
import com.company.baseballshop.repository.ReviewCommentRepository;
import com.company.baseballshop.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final ReviewCommentRepository reviewCommentRepository;

    @Value("${review.upload-dir}")
    private String reviewUploadDir;
    private Integer rating;
    public List<Review> getReviewsByNickname(String nickname) {
        return reviewRepository.findByNickname(nickname);
    }

    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }


    public Review createReview(String nickname, String content, Long productId, MultipartFile image, Integer rating) throws IOException {
        this.rating = rating;
        Review review = new Review();
        review.setNickname(nickname);
        review.setRating(getRating());
        review.setContent(String.valueOf(content));
        Product product = new Product();
        product.setId(productId);
        review.setProduct(product);



        if (image != null && !image.isEmpty()) {
            String fileName = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
            Path filePath = Paths.get(reviewUploadDir, fileName);
            Files.createDirectories(filePath.getParent());
            Files.write(filePath, image.getBytes());
            review.setImageUrl("/review_img/" + fileName);
        }

        return reviewRepository.save(review);
    }

    public Review updateReview(Long id, String nickname, String content, MultipartFile image) throws IOException {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다."));
        if (!review.getNickname().equals(nickname)) {
            throw new IllegalArgumentException("본인이 작성한 리뷰만 수정할 수 있습니다.");
        }

        review.setContent(content);

        if (image != null && !image.isEmpty()) {
            if (review.getImageUrl() != null) {
                Path oldFilePath = Paths.get("." + review.getImageUrl());
                Files.deleteIfExists(oldFilePath);
            }
            String fileName = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
            Path filePath = Paths.get(reviewUploadDir, fileName);
            Files.createDirectories(filePath.getParent());
            Files.write(filePath, image.getBytes());
            review.setImageUrl("/review_img/" + fileName);
        }

        return reviewRepository.save(review);
    }

    public void deleteReview(Long id, String nickname, boolean isAdmin) throws IOException {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다."));
        if (!isAdmin && !review.getNickname().equals(nickname)) {
            throw new IllegalArgumentException("본인이 작성한 리뷰이거나 관리자만 삭제할 수 있습니다.");
        }
        if (review.getImageUrl() != null) {
            Path filePath = Paths.get("." + review.getImageUrl());
            Files.deleteIfExists(filePath);
        }
        reviewRepository.deleteById(id);
    }
    public ReviewComment addComment(Long reviewId, String content) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다."));
        ReviewComment comment = new ReviewComment();
        comment.setReview(review);
        comment.setContent(content);
        return reviewCommentRepository.save(comment);
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }
}
