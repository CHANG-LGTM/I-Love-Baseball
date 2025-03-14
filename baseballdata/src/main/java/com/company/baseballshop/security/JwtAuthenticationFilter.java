package com.company.baseballshop.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Arrays;

@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final List<String> excludePaths = Arrays.asList("/api/auth/login", "/api/auth/register");
    private final JwtTokenProvider jwtTokenProvider;

    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        // ✅ /api/auth/check-auth는 필터링 적용
        boolean shouldNotFilter = excludePaths.contains(path) || path.startsWith("/login/oauth2/");
        log.info("Should not filter {}: {}", path, shouldNotFilter);
        return shouldNotFilter;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        log.info("Processing request: {}", request.getRequestURI());

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

        // ✅ 토큰 검증 및 인증 설정
        if (token != null && jwtTokenProvider.validateToken(token)) {
            String email = jwtTokenProvider.getEmailFromToken(token);
            String role = jwtTokenProvider.getRoleFromToken(token);
            Authentication auth = new UsernamePasswordAuthenticationToken(
                    email, null, Collections.singleton(new SimpleGrantedAuthority(role)));
            SecurityContextHolder.getContext().setAuthentication(auth);
            log.info("Token validated for email: {}, role: {}", email, role);
        } else {
            log.info("No valid token found for request: {}", request.getRequestURI());
        }

        filterChain.doFilter(request, response);
    }
}