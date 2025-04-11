package com.company.baseballshop.dto;

public class AuthRequest {
    private String email;
    private String password;
    private String nickname;
    private Role role;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    public Role getRole() {
        return role != null ? role : Role.USER; // 기본값 설정
    }

    public void setRole(Role role) {
        this.role = role;
    }
}