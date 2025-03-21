package com.company.baseballshop.controller;

import com.company.baseballshop.dto.AddCartItemRequest;
import com.company.baseballshop.dto.CartItemDTO;
import com.company.baseballshop.dto.UpdateCartItemRequest;
import com.company.baseballshop.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @PostMapping("/add")
    public ResponseEntity<String> addCartItem(@RequestBody AddCartItemRequest request) {
        String email = getCurrentUserEmail();
        if (email == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }
        cartService.addCartItem(email, request);
        return ResponseEntity.ok("장바구니에 상품이 추가되었습니다.");
    }

    @GetMapping
    public ResponseEntity<List<CartItemDTO>> getCartItems() {
        String email = getCurrentUserEmail();
        if (email == null) {
            return ResponseEntity.status(401).build();
        }
        List<CartItemDTO> cartItems = cartService.getCartItems(email);
        return ResponseEntity.ok(cartItems);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<String> updateCartItem(@PathVariable Long id, @RequestBody UpdateCartItemRequest request) {
        String email = getCurrentUserEmail();
        if (email == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }
        cartService.updateCartItem(id, request);
        return ResponseEntity.ok("장바구니 항목이 수정되었습니다.");
    }

    @DeleteMapping("/remove/{id}")
    public ResponseEntity<String> removeCartItem(@PathVariable Long id) {
        String email = getCurrentUserEmail();
        if (email == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }
        cartService.removeCartItem(id);
        return ResponseEntity.ok("장바구니 항목이 삭제되었습니다.");
    }

    private String getCurrentUserEmail() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof String) {
            return (String) principal; // email 반환
        }
        return null;
    }
}