package com.company.baseballshop.controller;
import com.company.baseballshop.dto.AuthRequest;
import com.company.baseballshop.dto.Role;
import com.company.baseballshop.security.JwtTokenProvider;

import com.company.baseballshop.model.User;
import com.company.baseballshop.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/signup")
    public String signup(@RequestBody AuthRequest authRequest) {
        log.info("user: {}", authRequest);
        authRequest.setPassword(passwordEncoder.encode(authRequest.getPassword()));
        authRequest.setRole(Role.valueOf("USER"));

        User user = new User(null, authRequest.getEmail(), authRequest.getPassword(), Role.USER, "", "");
        userRepository.save(user);
        return "회원가입 성공";
    }

    @PostMapping("/login")
    public String login(@RequestBody User user) {
        Optional<User> foundUser = userRepository.findByEmail(user.getEmail());
        if (foundUser.isPresent() && passwordEncoder.matches(user.getPassword(), foundUser.get().getPassword())) {
            return jwtTokenProvider.createToken(user.getEmail(), foundUser.get().getRole()); // 수정된 메서드 사용
        }
        return "로그인 실패";
    }
}
