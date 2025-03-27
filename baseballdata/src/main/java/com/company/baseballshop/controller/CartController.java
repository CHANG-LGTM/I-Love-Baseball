package com.company.baseballshop.controller;

import com.company.baseballshop.dto.AddCartItemRequest;
import com.company.baseballshop.dto.CartItemDTO;
import com.company.baseballshop.dto.UpdateCartItemRequest;
import com.company.baseballshop.service.CartService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"}, allowCredentials = "true")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @PostMapping("/add")
    public ResponseEntity<String> addCartItem(@RequestBody AddCartItemRequest request) {
        String email = getCurrentUserEmail();
        if (email == null) {
            log.warn("인증되지 않은 사용자가 장바구니 추가 요청");
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }
        log.info("장바구니 추가 요청: email={}, productId={}", email, request.getProductId());
        cartService.addCartItem(email, request);
        return ResponseEntity.ok("장바구니에 상품이 추가되었습니다.");
    }

    @GetMapping
    public ResponseEntity<List<CartItemDTO>> getCartItems() {
        String email = getCurrentUserEmail();
        if (email == null) {
            log.warn("인증되지 않은 사용자가 장바구니 조회 요청");
            return ResponseEntity.status(401).build();
        }
        log.info("장바구니 조회 요청: email={}", email);
        List<CartItemDTO> cartItems = cartService.getCartItems(email);
        return ResponseEntity.ok(cartItems);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<String> updateCartItem(@PathVariable Long id, @RequestBody UpdateCartItemRequest request) {
        String email = getCurrentUserEmail();
        if (email == null) {
            log.warn("인증되지 않은 사용자가 장바구니 수정 요청");
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }
        log.info("장바구니 수정 요청: email={}, cartItemId={}", email, id);
        cartService.updateCartItem(id, request);
        return ResponseEntity.ok("장바구니 항목이 수정되었습니다.");
    }

    @DeleteMapping("/remove/{id}")
    public ResponseEntity<String> removeCartItem(@PathVariable Long id) {
        String email = getCurrentUserEmail();
        if (email == null) {
            log.warn("인증되지 않은 사용자가 장바구니 삭제 요청");
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }
        log.info("장바구니 삭제 요청: email={}, cartItemId={}", email, id);
        cartService.removeCartItem(id);
        return ResponseEntity.ok("장바구니 항목이 삭제되었습니다.");
    }

    private String getCurrentUserEmail() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof String) {
            return (String) principal;
        }
        return null;
    }
}