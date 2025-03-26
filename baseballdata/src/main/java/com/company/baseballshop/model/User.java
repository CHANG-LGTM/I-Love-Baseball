package com.company.baseballshop.model;

import com.company.baseballshop.dto.Role;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

@Entity
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "users")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false) // 닉네임 추가 (필수값)
    private String nickname;

    @Enumerated(EnumType.STRING)
    private Role role;

    private String provider;

    private String providerId;

    public User(Object o, String email, String encodedPassword, Role role, String s, String s1) {
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(role.getAuthority());
    }

    @Override
    public String getUsername() {
        return email;
    }

    // ✅ 비밀번호 반환 (DB 저장된 해싱된 비밀번호)
    @Override
    public String getPassword() {
        return this.password;
    }

    // ✅ 닉네임 Getter 추가 (UserDetails 인터페이스와 무관)
    public String getNickname() {
        return this.nickname;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
