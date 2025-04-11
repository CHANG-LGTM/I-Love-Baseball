package com.company.baseballshop.service;

import com.company.baseballshop.dto.AuthRequest;
import com.company.baseballshop.dto.AuthResponse;
import com.company.baseballshop.dto.Role;
import com.company.baseballshop.model.User;
import com.company.baseballshop.repository.UserRepository;
import com.company.baseballshop.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    // 이메일 중복 확인
    public boolean isEmailTaken(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    // 닉네임 중복 확인
    public boolean isNicknameTaken(String nickname) {
        return userRepository.findByNickname(nickname).isPresent();
    }

    public AuthResponse signup(AuthRequest request) {
        // 이메일 검증
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("이메일을 입력하세요.");
        }
        if (isEmailTaken(request.getEmail())) {
            throw new IllegalArgumentException("이미 존재하는 이메일입니다.");
        }

        // 비밀번호 검증
        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("비밀번호를 입력하세요.");
        }
        // 비밀번호 길이 검증 (최소 8자)
        if (request.getPassword().length() < 8) {
            throw new IllegalArgumentException("비밀번호는 최소 8자 이상이어야 합니다.");
        }

        // Role 변환
        Role userRole;
        String roleInput = String.valueOf(request.getRole());
        if (roleInput == null || roleInput.trim().isEmpty()) {
            userRole = Role.USER; // 기본값 설정
        } else {
            try {
                roleInput = roleInput.trim().toUpperCase();
                Set<String> validRoles = new HashSet<>(Arrays.asList(
                        Arrays.stream(Role.values())
                                .map(Enum::name)
                                .toArray(String[]::new)
                ));
                if (!validRoles.contains(roleInput)) {
                    throw new IllegalArgumentException("유효하지 않은 역할입니다: " + roleInput + ". 허용된 값: " + validRoles);
                }
                userRole = Role.valueOf(roleInput);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("유효하지 않은 역할입니다: " + roleInput + ". 허용된 값: " + Arrays.toString(Role.values()));
            }
        }

        // 닉네임 설정
        String nickname = request.getNickname();
        if (nickname == null || nickname.trim().isEmpty()) {
            if (!request.getEmail().contains("@")) {
                throw new IllegalArgumentException("유효하지 않은 이메일 형식입니다: " + request.getEmail());
            }
            nickname = request.getEmail().split("@")[0];
        }
        if (isNicknameTaken(nickname)) {
            throw new IllegalArgumentException("이미 존재하는 닉네임입니다: " + nickname);
        }

        // User 객체 생성
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .nickname(nickname)
                .role(userRole)
                .build();

        // 데이터베이스 저장
        try {
            userRepository.save(user);
            log.info("회원가입 완료: email={}, role={}", user.getEmail(), user.getRole());
        } catch (Exception e) {
            log.error("데이터베이스 저장 실패: email={}, error={}", request.getEmail(), e.getMessage(), e);
            throw new RuntimeException("사용자 저장 중 오류가 발생했습니다: " + e.getMessage());
        }

        // JWT 토큰 생성
        try {
            String token = jwtTokenProvider.createToken(user.getEmail(), user.getRole().name());
            return new AuthResponse(token);
        } catch (Exception e) {
            log.error("JWT 토큰 생성 실패: email={}, error={}", user.getEmail(), e.getMessage(), e);
            throw new RuntimeException("JWT 토큰 생성 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        log.info("로그인 성공: email={}, role={}", user.getEmail(), user.getRole());

        String token = jwtTokenProvider.createToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(token);
    }
}