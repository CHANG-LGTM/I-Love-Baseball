package com.company.baseballshop.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Entity
@Table(name = "discounted_products")
public class DiscountedProduct {

    // Getter와 Setter
    @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        private String name;
        private String description;

        @Column(name = "original_price")
        private double originalPrice;

        @Column(name = "discount_percent")
        private int discountPercent;

        private String category;

        @Column(name = "image_url")
        private String imageUrl;

        // 기본 생성자
        public DiscountedProduct() {}

}

