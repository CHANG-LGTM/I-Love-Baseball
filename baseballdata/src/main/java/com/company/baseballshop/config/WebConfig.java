package com.company.baseballshop.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("*");
    }
}

// 🔥 `favicon.ico` 요청을 무시하는 컨트롤러 추가
@RestController
class FaviconController {
    @RequestMapping("favicon.ico")
    public void favicon() {
        // 요청을 무시
    }
}
