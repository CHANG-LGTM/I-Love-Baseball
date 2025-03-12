package com.company.baseballshop.security;

import com.company.baseballshop.dto.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
@Getter
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String secretKey;

    private final long EXPIRATION_TIME = 86400000; // 1 day

    // SECRET_KEY를 바이트 배열로 변환하여 Key 객체로 사용
    private SecretKey getSigningKey() {
        byte[] keyBytes = secretKey.getBytes();
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String createToken(String email, Role role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role.getRoleName());

        return Jwts.builder()
                .claims(claims)  // setClaims 대신 claims 사용
                .subject(email)  // setSubject 대신 subject 사용
                .issuedAt(new Date())  // setIssuedAt 대신 issuedAt 사용
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))  // setExpiration 대신 expiration 사용
                .signWith(getSigningKey())  // signWith에 Key 객체 사용, 알고리즘 별도 지정 불필요
                .compact();
    }

    public String getEmailFromToken(String token) {
        return getClaims(token).getSubject();
    }

    public boolean validateToken(String token) {
        try {
            getClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())  // setSigningKey 대신 verifyWith 사용
                .build()  // parser를 빌드해야 함
                .parseSignedClaims(token)  // parseClaimsJws 대신 parseSignedClaims 사용
                .getPayload();  // getBody 대신 getPayload 사용
    }
}