package com.company.baseballshop.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Entity
@Table(name = "discounted_products")
public class DiscountedProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "original_price", nullable = false)
    private int originalPrice; // SQL에서 INT로 정의되었으므로 int로 변경

    @Column(name = "discount_percent", nullable = false)
    private int discountPercent;

    @Column(name = "stock", nullable = false)
    private int stock; // stock 필드 추가 및 int로 설정

    @Column(name = "category", nullable = false, length = 50)
    private String category;

    @Column(name = "image_url", nullable = false, length = 255)
    private String imageUrl;


}