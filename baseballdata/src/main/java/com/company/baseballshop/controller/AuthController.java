package com.company.baseballshop.controller;

import com.company.baseballshop.dto.AuthRequest;
import com.company.baseballshop.dto.Role;
import com.company.baseballshop.security.JwtTokenProvider;
import com.company.baseballshop.model.User;
import com.company.baseballshop.repository.UserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.Map;
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

    @PostMapping("/register")
    public ResponseEntity<?> signup(@RequestBody AuthRequest authRequest) {
        log.info("회원가입 요청: {}", authRequest);

        // 비밀번호가 null 또는 빈 값인지 확인
        if (authRequest.getPassword() == null || authRequest.getPassword().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("비밀번호를 입력하세요.");
        }

        // 비밀번호 해싱 후 로그 출력
        String encodedPassword = passwordEncoder.encode(authRequest.getPassword());
        log.info("해싱된 비밀번호: {}", encodedPassword);

        User user = new User(null, authRequest.getEmail(), encodedPassword, authRequest.getNickname(), Role.USER, "", "");
        userRepository.save(user);

        log.info("회원가입 완료! 저장된 유저 정보: {}", user);
        return ResponseEntity.ok("회원가입 성공");
    }

    @GetMapping("/check-auth")
    public ResponseEntity<?> checkAuth(HttpServletRequest request) {
        // ✅ 쿠키에서 JWT 토큰 추출
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

        // ✅ 토큰 검증 및 사용자 정보 반환
        if (token != null && jwtTokenProvider.validateToken(token)) {
            String email = jwtTokenProvider.getEmailFromToken(token);
            String role = jwtTokenProvider.getRoleFromToken(token);
            log.info("인증된 사용자: email={}, role={}", email, role);
            return ResponseEntity.ok(new AuthResponse(true, email, role));
        } else {
            log.warn("토큰 검증 실패 또는 토큰 없음");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new AuthResponse(false, null, null));
        }
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

        // JWT 토큰 생성
        String token = jwtTokenProvider.createToken(user.getEmail(), user.getRole());

        // Secure HttpOnly Cookie 설정
        ResponseCookie cookie = ResponseCookie.from("jwt", token)
                .httpOnly(true)  // JavaScript에서 접근 불가능 (XSS 방지)
                .secure(false)   // 개발 환경에서는 false, 배포 시 true로 변경
                .path("/")       // 모든 경로에서 쿠키 사용 가능
                .sameSite("Strict") // CSRF 방지
                .maxAge(Duration.ofHours(24)) // 24시간(1일) 동안 유지
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        // 응답에는 닉네임만 반환 (JWT는 쿠키에 저장됨)
        return ResponseEntity.ok(Map.of("nickname", user.getNickname()));
    }
}

// AuthResponse 클래스 정의
class AuthResponse {
    private boolean isAuthenticated;
    private String email;
    private String role;

    public AuthResponse(boolean isAuthenticated, String email, String role) {
        this.isAuthenticated = isAuthenticated;
        this.email = email;
        this.role = role;
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
}