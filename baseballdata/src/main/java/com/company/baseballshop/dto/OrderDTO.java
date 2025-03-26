package com.company.baseballshop.dto;


import java.util.List;
import lombok.Data;


@Data
public class OrderDTO {
    private Long id;
    private List<CartItemDTO> cartItems;
}