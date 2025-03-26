package com.company.baseballshop.dto;

import lombok.Data;

@Data
public class PaymentResponse {
    private String paymentKey;
    private String orderId;
    private String redirectUrl;
    // 매개변수를 받는 생성자 추가
    public PaymentResponse() {
        this.paymentKey = paymentKey;
        this.orderId = orderId;
        this.redirectUrl = redirectUrl;
    }
}
