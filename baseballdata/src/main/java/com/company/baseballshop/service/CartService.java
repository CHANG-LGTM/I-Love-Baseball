package com.company.baseballshop.service;

import com.company.baseballshop.dto.AddCartItemRequest;
import com.company.baseballshop.dto.CartItemDTO;
import com.company.baseballshop.dto.UpdateCartItemRequest;
import com.company.baseballshop.model.CartItem;
import com.company.baseballshop.model.Product;
import com.company.baseballshop.model.User;
import com.company.baseballshop.repository.CartItemRepository;
import com.company.baseballshop.repository.ProductRepository;
import com.company.baseballshop.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public CartService(CartItemRepository cartItemRepository, UserRepository userRepository, ProductRepository productRepository) {
        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public void addCartItem(String email, AddCartItemRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));

        // 이미 장바구니에 있는 상품인지 확인
        CartItem existingItem = cartItemRepository.findByUserAndProduct(user, product)
                .orElse(null);
        if (existingItem != null) {
            existingItem.setQuantity(existingItem.getQuantity() + 1);
            cartItemRepository.save(existingItem);
        } else {
            CartItem cartItem = new CartItem();
            cartItem.setUser(user);
            cartItem.setProduct(product);
            cartItem.setQuantity(1);
            cartItemRepository.save(cartItem);
        }
    }

    @Transactional(readOnly = true)
    public List<CartItemDTO> getCartItems(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        List<CartItem> cartItems = cartItemRepository.findByUser(user);
        return cartItems.stream().map(item -> {
            CartItemDTO dto = new CartItemDTO();
            dto.setId(item.getId());
            dto.setProductId(item.getProduct().getId());
            dto.setName(item.getProduct().getName());
            dto.setPrice(item.getProduct().getPrice());
            dto.setImage(item.getProduct().getImage());
            dto.setQuantity(item.getQuantity());
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    public void updateCartItem(Long cartItemId, UpdateCartItemRequest request) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new IllegalArgumentException("장바구니 항목을 찾을 수 없습니다."));
        cartItem.setQuantity(request.getQuantity());
        cartItemRepository.save(cartItem);
    }

    @Transactional
    public void removeCartItem(Long cartItemId) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new IllegalArgumentException("장바구니 항목을 찾을 수 없습니다."));
        cartItemRepository.delete(cartItem);
    }
}