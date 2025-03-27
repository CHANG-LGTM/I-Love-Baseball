package com.company.baseballshop.controller;

import com.company.baseballshop.dto.AuthRequest;
import com.company.baseballshop.dto.Role;
import com.company.baseballshop.model.User;
import com.company.baseballshop.repository.UserRepository;
import com.company.baseballshop.security.JwtTokenProvider;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"}, allowCredentials = "true")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> signup(@RequestBody AuthRequest authRequest) {
        log.info("회원가입 요청: {}", authRequest);

        if (authRequest.getPassword() == null || authRequest.getPassword().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("비밀번호를 입력하세요.");
        }

        Optional<User> existingUser = userRepository.findByEmail(authRequest.getEmail());
        if (existingUser.isPresent()) {
            return ResponseEntity.badRequest().body("이미 존재하는 이메일입니다.");
        }

        String encodedPassword = passwordEncoder.encode(authRequest.getPassword());
        log.info("해싱된 비밀번호: {}", encodedPassword);

        User user = new User(null, authRequest.getEmail(), encodedPassword, authRequest.getNickname(), Role.ADMIN, "", "");
        userRepository.save(user);

        log.info("회원가입 완료! 저장된 유저 정보: {}", user);
        return ResponseEntity.ok("회원가입 성공");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest authRequest, HttpServletResponse response) {
        Optional<User> foundUser = userRepository.findByEmail(authRequest.getEmail());

        if (foundUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "이메일이 존재하지 않습니다."));
        }

        User user = foundUser.get();

        if (!passwordEncoder.matches(authRequest.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "이메일 또는 비밀번호가 올바르지 않습니다."));
        }

        String token = jwtTokenProvider.createToken(user.getEmail(), user.getRole().toString());

        ResponseCookie cookie = ResponseCookie.from("jwt", token)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .sameSite("Strict")
                .maxAge(Duration.ofHours(24))
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok(Map.of("nickname", user.getNickname()));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("jwt", null)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .sameSite("Strict")
                .maxAge(0)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        log.info("로그아웃 성공: JWT 쿠키 삭제됨");

        return ResponseEntity.ok(Map.of("message", "로그아웃 성공"));
    }

    @GetMapping("/check-auth")
    public ResponseEntity<?> checkAuth(HttpServletRequest request) {
        String token = null;
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("jwt".equals(cookie.getName())) {
                    token = cookie.getValue();
                    log.info("추출된 JWT 토큰: {}", token);
                    break;
                }
            }
        }

        if (token != null && jwtTokenProvider.validateToken(token)) {
            String email = jwtTokenProvider.getEmailFromToken(token);
            String role = jwtTokenProvider.getRoleFromToken(token);

            Optional<User> foundUser = userRepository.findByEmail(email);
            if (foundUser.isEmpty()) {
                log.warn("사용자를 찾을 수 없음: email={}", email);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new AuthResponse(false, null, null, null));
            }

            User user = foundUser.get();
            String nickname = user.getNickname();

            log.info("인증된 사용자: email={}, role={}, nickname={}", email, role, nickname);
            return ResponseEntity.ok(new AuthResponse(true, email, role, nickname));
        } else {
            log.warn("토큰 검증 실패 또는 토큰 없음");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new AuthResponse(false, null, null, null));
        }
    }

    @GetMapping("/check-role")
    public ResponseEntity<Map<String, Object>> checkRole(HttpServletRequest request) {
        String token = null;
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("jwt".equals(cookie.getName())) {
                    token = cookie.getValue();
                    log.info("추출된 JWT 토큰: {}", token);
                    break;
                }
            }
        }

        Map<String, Object> response = new HashMap<>();
        if (token != null && jwtTokenProvider.validateToken(token)) {
            String email = jwtTokenProvider.getEmailFromToken(token);
            String role = jwtTokenProvider.getRoleFromToken(token);

            Optional<User> foundUser = userRepository.findByEmail(email);
            if (foundUser.isEmpty()) {
                log.warn("사용자를 찾을 수 없음: email={}", email);
                response.put("roles", List.of());
                response.put("nickname", null);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            User user = foundUser.get();
            response.put("roles", List.of(role));
            response.put("nickname", user.getNickname());
            log.info("역할 확인: nickname={}, roles={}", user.getNickname(), role);
            return ResponseEntity.ok(response);
        }

        response.put("roles", List.of());
        response.put("nickname", null);
        return ResponseEntity.ok(response);
    }
}

class AuthResponse {
    private boolean isAuthenticated;
    private String email;
    private String role;
    private String nickname;

    public AuthResponse(boolean isAuthenticated, String email, String role, String nickname) {
        this.isAuthenticated = isAuthenticated;
        this.email = email;
        this.role = role;
        this.nickname = nickname;
    }

    public boolean isAuthenticated() {
        return isAuthenticated;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    public String getNickname() {
        return nickname;
    }
}