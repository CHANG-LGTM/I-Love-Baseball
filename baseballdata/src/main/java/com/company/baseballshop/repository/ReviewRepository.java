package com.company.baseballshop.repository;

import com.company.baseballshop.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByNickname(String nickname);

}