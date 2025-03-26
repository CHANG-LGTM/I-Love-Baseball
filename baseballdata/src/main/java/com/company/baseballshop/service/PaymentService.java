package com.company.baseballshop.service;

import com.company.baseballshop.dto.CartItemDTO;
import com.company.baseballshop.dto.PaymentRequest;

import com.company.baseballshop.dto.PaymentResponse;

import com.company.baseballshop.model.Order;
import com.company.baseballshop.model.OrderItem;
import com.company.baseballshop.model.Product;
import com.company.baseballshop.model.User;
import com.company.baseballshop.repository.OrderItemRepository;
import com.company.baseballshop.repository.OrderRepository;
import com.company.baseballshop.repository.ProductRepository;
import com.company.baseballshop.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@Service
public class PaymentService {

    @Value("${portone.api-key}")
    private String apiKey;

    @Value("${portone.secret-key}")
    private String secretKey;

    @Value("${portone.store-id}")
    private String storeId;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    // 결제 준비 (주문 생성)
    public PaymentResponse initiatePayment(PaymentRequest requestDTO, String username) {
        // 사용자 조회
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with email: " + username));

        // 주문 생성
        Order order = new Order();
        order.setUser(user);
        order.setAmount(Math.toIntExact(requestDTO.getAmount()));
        order.setOrderName(requestDTO.getOrderName());
        order.setCustomerName(requestDTO.getCustomerName());
        order.setCustomerPhone(requestDTO.getCustomerPhone());
        order.setCustomerAddress(requestDTO.getCustomerAddress());
        order.setPaymentMethod(requestDTO.getPaymentMethod());
        order.setStatus("PENDING");
        order = orderRepository.save(order);

        // 주문 항목 저장
        for (CartItemDTO cartItem : requestDTO.getCartItems()) {
            Product product = productRepository.findById(cartItem.getProductId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found with id: " + cartItem.getProductId()));

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPriceAtPurchase(product.getPrice());
            orderItemRepository.save(orderItem);
        }

        // 응답 DTO 생성
        PaymentResponse responseDTO = new PaymentResponse();
        responseDTO.setOrderId(String.valueOf(order.getId()));
        // 포트원 결제 SDK를 사용하므로 redirectUrl은 프론트엔드에서 처리
        return responseDTO;
    }

    // 결제 검증
    public void verifyPayment(String paymentKey, Long orderId) {
        // 포트원 결제 정보 조회 API 호출
        String url = "https://api.portone.io/payments/" + paymentKey; // 포트원 API v2 엔드포인트
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + apiKey); // 포트원 API 인증 방식
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> entity = new HttpEntity<>(headers);
        ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);

        if (response.getStatusCode() != HttpStatus.OK) {
            throw new RuntimeException("Failed to verify payment with PortOne: " + response.getStatusCode());
        }

        Map<String, Object> paymentData = response.getBody();
        if (paymentData == null) {
            throw new RuntimeException("No payment data returned from PortOne");
        }

        // 포트원 API 응답 구조에 따라 필드 확인
        Map<String, Object> payment = (Map<String, Object>) paymentData.get("payment");
        if (payment == null) {
            throw new RuntimeException("Invalid payment data structure from PortOne");
        }

        String status = (String) payment.get("status");
        Map<String, Object> amountData = (Map<String, Object>) payment.get("amount");
        Integer amount = amountData != null ? (Integer) amountData.get("total") : null;

        if (status == null || amount == null) {
            throw new RuntimeException("Missing status or amount in PortOne response");
        }

        // 주문 조회
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found with id: " + orderId));

        // 결제 상태 확인
        if (!status.equals("PAID")) {
            order.setStatus("FAILED");
            orderRepository.save(order);
            throw new RuntimeException("Payment not completed: " + status);
        }

        // 결제 금액 검증
        if (!amount.equals(order.getAmount())) {
            order.setStatus("FAILED");
            orderRepository.save(order);
            throw new RuntimeException("Payment amount mismatch: expected " + order.getAmount() + ", got " + amount);
        }

        // 결제 성공 시 주문 상태 업데이트
        order.setStatus("COMPLETED");
        orderRepository.save(order);
    }
}