# ⚾ BaseballData 프로젝트

야구 용품 데이터를 수집하고, 사용자에게 최적의 상품을 추천하는 **Spring Boot 기반 백엔드 애플리케이션**입니다.

---
## 🛠 Tech Stack

<p align="center">
  <img src="https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white"/>
  <img src="https://img.shields.io/badge/Gradle-02303A?style=for-the-badge&logo=gradle&logoColor=white"/>
  <img src="https://img.shields.io/badge/Java-007396?style=for-the-badge&logo=openjdk&logoColor=white"/>
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white"/>
  <img src="https://img.shields.io/badge/JPA-59666C?style=for-the-badge&logo=hibernate&logoColor=white"/>
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white"/>
  <img src="https://img.shields.io/badge/OAuth2-3c5c92?style=for-the-badge&logo=oauth&logoColor=white"/>
  <img src="https://img.shields.io/badge/Lombok-FF2D20?style=for-the-badge&logo=lombok&logoColor=white"/>
  <img src="https://img.shields.io/badge/Spring_Security-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white"/>
  <img src="https://img.shields.io/badge/JUnit-25A162?style=for-the-badge&logo=junit5&logoColor=white"/>
</p>
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB"/>
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white"/>
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



