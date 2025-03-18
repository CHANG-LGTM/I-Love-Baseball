package com.company.baseballshop.security;

import com.company.baseballshop.dto.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Collections;
import java.util.Date;
import java.util.List;

@Slf4j
@Component
@Getter
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String secretKey; // JWT 서명을 위한 비밀 키

    private final long EXPIRATION_TIME = 86400000; // 토큰 만료 시간: 1일 (밀리초 단위)

    // 비밀 키를 디코딩하여 서명 키를 생성
    private SecretKey getSigningKey() {
        try {
            byte[] keyBytes = Decoders.BASE64.decode(secretKey);
            return Keys.hmacShaKeyFor(keyBytes);
        } catch (IllegalArgumentException e) {
            log.error("비밀 키 디코딩 실패: {}", e.getMessage());
            throw new IllegalStateException("잘못된 비밀 키 설정입니다. Base64 인코딩된 값을 확인하세요.", e);
        }
    }

    // JWT 토큰 생성
    public String createToken(String email, Role role) {
        if (email == null || email.trim().isEmpty()) {
            log.error("이메일이 null이거나 비어 있습니다: {}", email);
            throw new IllegalArgumentException("이메일은 필수입니다.");
        }
        if (role == null) {
            log.error("역할이 null입니다");
            throw new IllegalArgumentException("역할은 필수입니다.");
        }

        // Claims 객체를 빌더로 생성
        Date now = new Date();
        Date expiration = new Date(now.getTime() + EXPIRATION_TIME);

        return Jwts.builder()
                .setSubject(email) // 이메일을 주체로 설정
                .claim("role", role.name()) // 역할 정보를 추가
                .setIssuedAt(now) // 발행 시간
                .setExpiration(expiration) // 만료 시간
                .signWith(getSigningKey()) // 서명
                .compact(); // 토큰 생성
    }

    // 요청에서 JWT 토큰을 추출
    public String resolveToken(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("jwt".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    // 토큰에서 이메일 추출
    public String getEmailFromToken(String token) {
        return getClaims(token).getSubject();
    }

    // 토큰 유효성 검증
    public boolean validateToken(String token) {
        try {
            getClaims(token);
            return true;
        } catch (Exception e) {
            log.error("JWT 검증 실패: {}", e.getMessage());
            return false;
        }
    }

    // 인증 객체 생성
    public Authentication getAuthentication(String token) {
        Claims claims = getClaims(token);
        String email = claims.getSubject();
        String role = claims.get("role", String.class);
        List<SimpleGrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role));
        return new UsernamePasswordAuthenticationToken(email, null, authorities);
    }

    // 토큰에서 Claims 추출
    private Claims getClaims(String token) {
        if (token == null) {
            throw new IllegalArgumentException("토큰이 null입니다.");
        }
        return Jwts.parser()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // 토큰에서 역할 추출
    public String getRoleFromToken(String token) {
        return getClaims(token).get("role", String.class);
    }
}