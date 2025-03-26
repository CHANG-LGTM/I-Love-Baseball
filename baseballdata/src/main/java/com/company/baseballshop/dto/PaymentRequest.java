package com.company.baseballshop.dto;

import com.company.baseballshop.model.CartItem;
import lombok.Data;

import java.util.List;

@Data
public class PaymentRequest {
    private Long amount;
    private String orderName;
    private String customerName;
    private String customerPhone;
    private String customerAddress;
    private String paymentMethod;
    private List<CartItem> cartItems;


}