package com.company.baseballshop.security;

import com.company.baseballshop.dto.Role;
import com.company.baseballshop.model.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        CustomOAuth2User oAuth2User = (CustomOAuth2User) authentication.getPrincipal();
        User user = oAuth2User.getUser();

        log.info("OAuth2 로그인 시도, 사용자: {}", user.getEmail());
        String token;
        try {
            // Role이 null일 경우 기본값으로 Role.USER 설정
            String role = (user.getRole() != null) ? user.getRole().name() : Role.USER.name();
            token = jwtTokenProvider.createToken(user.getEmail(), role);
            log.info("토큰 생성 성공: {}", token);
        } catch (Exception e) {
            log.error("토큰 생성 실패: {}", e.getMessage(), e);
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "토큰 생성 실패: " + e.getMessage());
            return;
        }

        String cookie = String.format("jwt=%s; Path=/; HttpOnly; SameSite=Strict; Max-Age=%d",
                token, 24 * 60 * 60);
        response.addHeader(HttpHeaders.SET_COOKIE, cookie);

        String redirectUrl = "https://baseball.teamace.shop/";
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}