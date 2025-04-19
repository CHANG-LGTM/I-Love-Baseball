# ⚾ BaseballData 프로젝트

야구 용품 데이터를 수집하고, 사용자에게 최적의 상품을 추천하는 **Spring Boot 기반 백엔드 애플리케이션**입니다.

---
# 기술 스택

## 프론트엔드
![Material-UI](https://img.shields.io/badge/Material--UI-0081CB?style=flat&logo=material-ui&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=flat&logo=axios&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=flat&logo=react-router&logoColor=white)
![ContextAPI](https://img.shields.io/badge/ContextAPI-61DAFB?style=flat&logo=react&logoColor=black)

## 백엔드
![Spring Security](https://img.shields.io/badge/Spring_Security-6DB33F?style=flat&logo=spring-security&logoColor=white)
![JPA](https://img.shields.io/badge/JPA-6DB33F?style=flat&logo=hibernate&logoColor=white)
![OAuth2](https://img.shields.io/badge/OAuth2-000000?style=flat&logo=oauth&logoColor=white)
![Daum Map API](https://img.shields.io/badge/Daum_Map_API-FFCD00?style=flat&logo=kakao&logoColor=black)
![PortOne API](https://img.shields.io/badge/PortOne_API-FF6200?style=flat&logo=portone&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat&logo=json-web-tokens&logoColor=white)

## AWS 배포
![EC2](https://img.shields.io/badge/EC2-FF9900?style=flat&logo=amazon-ec2&logoColor=white)
![RDS](https://img.shields.io/badge/RDS-527FFF?style=flat&logo=amazon-rds&logoColor=white)
![S3](https://img.shields.io/badge/S3-569A31?style=flat&logo=amazon-s3&logoColor=white)
![NginX](https://img.shields.io/badge/NginX-009639?style=flat&logo=nginx&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=flat&logo=spring-boot&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Java 17](https://img.shields.io/badge/Java_17-ED8B00?style=flat&logo=java&logoColor=white)
![Gradle](https://img.shields.io/badge/Gradle-02303A?style=flat&logo=gradle&logoColor=white)
![MySQL 8.0](https://img.shields.io/badge/MySQL_8.0-4479A1?style=flat&logo=mysql&logoColor=white)

## 추가 기술
![Lombok](https://img.shields.io/badge/Lombok-FF4500?style=flat&logo=lombok&logoColor=white)
![JUnit](https://img.shields.io/badge/JUnit-25A162?style=flat&logo=junit5&logoColor=white)
## 🔧 사용 기술 스택

| 구분 | 기술 |
|------|------|
| **백엔드 프레임워크** | Spring Boot 3.4.3 |
| **빌드 도구** | Gradle |
| **언어** | Java 17 |
| **ORM** | Spring Data JPA |
| **DB 연동** | MySQL |
| **보안** | Spring Security, JWT (JJWT 사용) |
| **인증/인가** | OAuth2 소셜 로그인 (ex. Google) |
| **검증** | Spring Validation |
| **Dev Tools** | Spring Boot Devtools |
| **Lombok** | Boilerplate 코드 제거용 |
| **테스트** | Spring Boot Starter Test, JUnit Platform |

---

## 🔐 인증 및 보안

- **JWT 기반 인증 토큰 처리**
- **Spring Security 기반 권한 처리**
- **OAuth2 클라이언트 연동 (소셜 로그인)**

---

## 🗃 데이터베이스

- MySQL을 기반으로 JPA Entity 매핑
- Repository 패턴 기반의 데이터 접근 계층 설계

---

## 🚀 프로젝트 실행 방법

1. `application.yml` 또는 `.env` 파일에 다음 설정 추가:
   - DB 접속 정보 (`spring.datasource.*`)
   - JWT 시크릿 키
   - OAuth2 Client 설정 (필요 시)

2. Gradle 빌드 및 실행:
   ```bash
   ./gradlew build
   ./gradlew bootRun
   ```
## 🌱 향후 계획
- 상품 추천 알고리즘 개선: 사용자 데이터 기반의 더 정교한 추천 시스템 구현

- 프론트엔드 개선: React와 Vite를 이용한 사용자 경험 향상

- 확장성 고려: 서비스의 확장을 위한 마이크로서비스 아키텍처 도입

- 백엔드와 결제 시스템 연동
- 



