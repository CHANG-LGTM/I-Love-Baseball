package com.company.baseballshop.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class OAuth2AuthenticationFailureHandler extends SimpleUrlAuthenticationFailureHandler {

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
                                        AuthenticationException exception) throws IOException {
        // ✅ 에러 메시지를 로그로 남기고, 사용자에게는 일반적인 메시지 전달
        logger.warn("OAuth2 인증 실패: {}");

        // ✅ 프론트엔드로 리다이렉트, 에러 세부사항 노출 최소화
        String redirectUrl = "http://localhost:5173/login?error=authentication_failed";

        // 상태 코드를 설정해 프론트엔드에서 추가 처리 가능
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401 Unauthorized

        // ✅ 리다이렉트 실행
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}