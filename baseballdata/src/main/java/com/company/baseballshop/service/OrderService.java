package com.company.baseballshop.service;

import com.company.baseballshop.dto.CartItemDTO;
import com.company.baseballshop.dto.OrderDTO;
import com.company.baseballshop.model.Order;
import com.company.baseballshop.model.OrderItem;
import com.company.baseballshop.model.Product;
import com.company.baseballshop.repository.OrderItemRepository;
import com.company.baseballshop.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    public OrderDTO getOrderById(Long id, String username) {
        // Order 조회, 없으면 404 예외 발생
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found with id: " + id));

        // 현재 사용자가 주문에 접근 권한이 있는지 확인
        if (!order.getUser().getEmail().equals(username)) {
            throw new AccessDeniedException("You do not have permission to access this order");
        }

        // OrderItem 조회
        List<OrderItem> orderItems = orderItemRepository.findByOrderId(id);
        List<CartItemDTO> cartItems = orderItems.stream().map(item -> {
            Product product = item.getProduct();
            return new CartItemDTO(
            );
        }).collect(Collectors.toList());

        // OrderDTO 생성 및 반환
        OrderDTO orderDTO = new OrderDTO();
        orderDTO.setId(order.getId());
        orderDTO.setCartItems(cartItems);
        return orderDTO;
    }
}