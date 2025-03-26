package com.company.baseballshop.controller;

import com.company.baseballshop.dto.PaymentRequest;

import com.company.baseballshop.dto.PaymentResponse;

import com.company.baseballshop.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/portone")
    public ResponseEntity<PaymentResponse> initiatePayment(
            @RequestBody PaymentRequest requestDTO,
            @AuthenticationPrincipal String email
    ) {
        PaymentResponse response = paymentService.initiatePayment(requestDTO, email);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/portone/verify")
    public ResponseEntity<String> verifyPayment(
            @RequestParam(name = "paymentKey") String paymentKey,
            @RequestParam(name="orderId") Long orderId
    ) {
        paymentService.verifyPayment(paymentKey, orderId);
        return ResponseEntity.ok("Payment verified successfully");
    }
}