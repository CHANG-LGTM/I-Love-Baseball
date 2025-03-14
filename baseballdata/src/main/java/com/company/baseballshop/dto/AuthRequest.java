package com.company.baseballshop.dto;


import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AuthRequest {
    private String email;
    private String password;
    private String nickname; // ✅ 닉네임 필드 추가
    private Role role; // 회원가입 시 사용될 역할 정보

    public AuthRequest(String email, String password, Role role,String nickname) {
        this.email = email;
        this.password = password;
        this.nickname = nickname;
        this.role = role;
    }
}

