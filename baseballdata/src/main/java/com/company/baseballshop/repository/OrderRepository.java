package com.company.baseballshop.repository;


import com.company.baseballshop.model.Order;
import com.company.baseballshop.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
}
