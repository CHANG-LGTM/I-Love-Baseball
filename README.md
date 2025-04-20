⚾ BaseballData 프로젝트
야구 용품 데이터를 수집하고, 사용자에게 최적의 상품을 추천하는 AWS 풀스택 기반 웹 애플리케이션입니다.사용자 친화적인 인터페이스와 실용적인 기능을 통해 야구 애호가들에게 최적의 장비 선택 경험을 제공합니다.

📋 프로젝트 개요
프로젝트 정보

이름: BaseballData
설명: 구 용품 판매를 위한 풀스택 웹 애플리케이션
GitHub: github.com/CHANG-LGTM/I-Love-Baseball
배포 페이지: baseball.teamace.shop

프로젝트 기획 동기
어릴 적부터 야구를 배우며 쌓아온 열정과 현재 사회인 야구 활동을 통해 깊어진 경험을 바탕으로, 평소 야구 장비에 대한 높은 관심을 프로젝트로 구현하게 되었습니다. 리액트와 스프링부트를 활용해 사용자 친화적이고 실용적인 야구용품점 페이지를 제작하며, 야구 애호가들에게 최적의 장비 선택 경험을 제공하고자 합니다.
프로젝트 목적

리액트와 스프링부트를 활용해 반응성 높고 안정적인 야구용품점 웹 페이지를 구현한다.
사용자 친화적인 인터페이스로 편리한 온라인 쇼핑 경험을 제공한다.
다양한 야구 장비의 상세 정보와 필터링 기능을 통해 최적의 제품 선택을 돕는다.
사회인 야구 활동 경험을 바탕으로 실용적인 기능과 실질적인 요구사항을 반영한다.
빠른 로딩 속도와 직관적인 내비게이션으로 사용자 만족도를 높인다.


📷 주요 페이지 스크린샷



메인 페이지
장바구니 페이지










마이페이지
리뷰 페이지










관리자 제품 등록 페이지
포트원 연동 결제 페이지








참고: 스크린샷 이미지는 placeholder로 대체되어 있습니다. 실제 이미지를 추가하려면 각 URL을 프로젝트 이미지로 교체하세요.


🛠️ 사용 기술 스택
프론트엔드
백엔드
AWS 배포
추가 기술
기술 스택 상세



구분
기술



백엔드 프레임워크
Spring Boot 3.4.3


빌드 도구
Gradle


언어
Java 17


ORM
Spring Data JPA


DB 연동
MySQL


보안
Spring Security, JWT (JJWT 사용)


인증/인가
OAuth2 소셜 로그인 (ex. Google, Kakao)


검증
Spring Validation


Dev Tools
Spring Boot Devtools


Lombok
Boilerplate 코드 제거용


테스트
Spring Boot Starter Test, JUnit Platform



📐 아키텍처 및 설계
Use Case Diagram
Data Modeling - ERD
Sequence Diagram
WireFrame (W/F)
Class Diagram

참고: 다이어그램 이미지는 placeholder로 대체되어 있습니다. 실제 다이어그램을 추가하려면 각 URL을 프로젝트 이미지로 교체하세요.


🔐 인증 및 보안

JWT 기반 인증 토큰 처리: JJWT를 활용한 stateless 인증 방식.
Spring Security 기반 권한 처리: 역할 기반 접근 제어 구현.
OAuth2 클라이언트 연동: Google, Kakao 소셜 로그인 지원.


🗃️ 데이터베이스

MySQL 기반 JPA Entity 매핑: 효율적인 데이터 관리.
Repository 패턴: 데이터 접근 계층 설계.


🖥️ 개발 세부 사항
프론트엔드 개발

API 주소 분리: 공용 데이터 환경변수로 관리.
인터페이스 지정: 데이터별 TypeScript 인터페이스 정의.
기술: React, Vite, Material-UI, Axios, React Router, ContextAPI.

백엔드 개발

Spring Security: 접근 제어 및 CORS 설정.
JWT 인증: 세션 없는 인증 방식 적용.
OAuth2.0: Kakao 소셜 로그인 연동.
환경변수: 민감 정보 분리.

AWS 배포

리눅스 명령어: 배포 환경 조작.
HTTPS 구성:
Cafe24를 통해 저비용 도메인 서비스 구매.
HTTPS 인증서 발급.
Nginx를 사용한 암호화된 HTTPS 요청 프록시.


보안 그룹: AWS 시스템 간 보안 설정.
S3 전환: 파일시스템에서 S3로 이미지 업로드 방식 변경.
AWS S3 버킷 연동을 위한 인증 키 사용.


RDS 전환: 개발용 로컬 DB에서 운영용 RDS로 데이터 마이그레이션.


📅 프로젝트 일정

참고: 일정 이미지는 placeholder로 대체되어 있습니다. 실제 타임라인 이미지를 추가하려면 URL을 교체하세요.


🚀 프로젝트 실행 방법

application.yml 또는 .env 설정:

DB 접속 정보 (spring.datasource.*)
JWT 시크릿 키
OAuth2 Client 설정 (필요 시)


Gradle 빌드 및 실행:
./gradlew build
./gradlew bootRun




🌱 향후 계획

추천 알고리즘 개선: 사용자 데이터 기반 정교한 추천 시스템.
프론트엔드 개선: React와 Vite를 활용한 UX 향상.
확장성 고려: 마이크로서비스 아키텍처 도입.
결제 시스템 연동: 포트원 API를 통한 결제 기능 강화.
추가 소셜 로그인: Naver, Google 등 연동 확대.


💡 KPT 회고
Keep

TypeScript에 맞는 컴포넌트별 interface 작성.
다양한 OpenAPI 연동으로 서비스 고도화.

Problem

보안 문제 인지 부족 - 추가 학습 필요.
커밋 소규모화 및 기능별 분리 필요.
프론트엔드 코드 구조 리팩토링 필요.

Try

GitHub Actions를 활용한 배포 프로세스 자동화.
Naver, Google 등 추가 소셜 로그인 연동.


📬 문의
궁금한 점이 있으시면 GitHub Issues를 통해 연락해주세요!
