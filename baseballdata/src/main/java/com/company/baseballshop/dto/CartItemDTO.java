package com.company.baseballshop.dto;


import lombok.Data;

@Data
public class CartItemDTO {
    private Long id;
    private Long productId;
    private String name;
    private Integer price;
    private String image;
    private Integer quantity;

    public CartItemDTO() {
        this.id = id;
        this.productId = productId;
        this.name = name;
        this.price = price;
        this.image = image;
        this.quantity = quantity;
    }
}
