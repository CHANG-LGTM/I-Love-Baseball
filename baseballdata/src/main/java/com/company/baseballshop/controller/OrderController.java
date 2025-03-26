package com.company.baseballshop.controller;

import com.company.baseballshop.dto.OrderDTO;
import com.company.baseballshop.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @GetMapping("/{id}")
    public ResponseEntity<OrderDTO> getOrderById(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails.getUsername();
        OrderDTO order = orderService.getOrderById(id, username);
        return ResponseEntity.ok(order);
    }
}