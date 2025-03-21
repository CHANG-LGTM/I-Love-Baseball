package com.company.baseballshop.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CartItemDTO {
    private Long id;
    private Long productId;
    private String name;
    private Integer price;
    private String image;
    private Integer quantity;
}