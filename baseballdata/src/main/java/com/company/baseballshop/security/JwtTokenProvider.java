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
    private String secretKey;

    private final long EXPIRATION_TIME = 86400000; // 1일 (24시간, 밀리초 단위)

    private SecretKey getSigningKey() {
        try {
            byte[] keyBytes = Decoders.BASE64.decode(secretKey);
            return Keys.hmacShaKeyFor(keyBytes);
        } catch (IllegalArgumentException e) {
            log.error("SecretKey 디코딩 실패: {}", e.getMessage());
            throw new IllegalStateException("잘못된 SecretKey 설정입니다. Base64 인코딩된 값을 확인하세요.", e);
        }
    }

    public String createToken(String email, Role role) {
        if (email == null || email.trim().isEmpty()) {
            log.error("이메일이 null 또는 비어 있습니다: {}", email);
            throw new IllegalArgumentException("이메일은 필수입니다.");
        }
        if (role == null) {
            log.error("역할이 null입니다");
            throw new IllegalArgumentException("역할은 필수입니다.");
        }

        Claims claims = (Claims) Jwts.claims().setSubject(email);
        claims.put("role", role.name());
        Date now = new Date();
        Date expiration = new Date(now.getTime() + EXPIRATION_TIME);

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(expiration)
                .signWith(getSigningKey())
                .compact();
    }

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

    public String getEmailFromToken(String token) {
        return getClaims(token).getSubject();
    }

    public boolean validateToken(String token) {
        try {
            getClaims(token);
            return true;
        } catch (Exception e) {
            log.error("JWT 검증 실패: {}", e.getMessage());
            return false;
        }
    }

    public Authentication getAuthentication(String token) {
        Claims claims = getClaims(token);
        String email = claims.getSubject();
        String role = claims.get("role", String.class);
        List<SimpleGrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role));
        return new UsernamePasswordAuthenticationToken(email, null, authorities);
    }

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

    public String getRoleFromToken(String token) {
        return getClaims(token).get("role", String.class);
    }
}