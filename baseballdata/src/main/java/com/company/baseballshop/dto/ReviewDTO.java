package com.company.baseballshop.dto;

import java.time.LocalDateTime;

public class ReviewDTO {
    private Long id;
    private String productName;
    private int rating;
    private String comment;
    private String createdAt;

    // Constructor
    public ReviewDTO(com.company.baseballshop.model.Review review) {
        this.id = review.getId();
        this.productName = review.getProduct().getName(); // Product 엔티티에서 name 필드를 가져옴
        this.rating = review.getRating();
        this.comment = review.getContent(); // content를 comment로 매핑
        this.createdAt = review.getCreatedAt().toString(); // LocalDateTime을 ISO-8601 문자열로 변환
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}