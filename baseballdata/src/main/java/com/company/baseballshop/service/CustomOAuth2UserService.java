package com.company.baseballshop.service;

import com.company.baseballshop.dto.Role;
import com.company.baseballshop.model.User;
import com.company.baseballshop.repository.UserRepository;
import com.company.baseballshop.security.CustomOAuth2User;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    public CustomOAuth2UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        Map<String, Object> attributes = oAuth2User.getAttributes();
        Long providerId = (Long) attributes.get("id");

        if (providerId == null) {
            throw new OAuth2AuthenticationException("Email not found in OAuth2 response");
        }
        Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
        Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");
        String nickname = (String) profile.get("nickname");
//        String profileImage = (String) profile.get("profile_image_url");
//        String thumbnail = (String) profile.get("thumbnail_image_url");





        String email = providerId + "@kakao.oauth.fakeemail.com";
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setNickname(nickname);
                    newUser.setPassword("GARA pw");
                    newUser.setProvider("Kakao");
                    newUser.setProviderId(providerId + "");
                    newUser.setRole(Role.USER); // Role 설정
                    return userRepository.save(newUser);
                });

        return new CustomOAuth2User(user, attributes);
    }
}