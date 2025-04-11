-- 기존 테이블 삭제 (필요 시)
set foreign_key_checks = 0;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS review_comments;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS products;
set foreign_key_checks = 1;



select * from products;



-- users 테이블 생성 (이미 존재하지 않는 경우)
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nickname VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- products 테이블 (기존 코드 유지)
CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price INT NOT NULL,
    original_price INT DEFAULT NULL,
    discount_percent INT DEFAULT NULL,
    stock INT NOT NULL DEFAULT 0,
    category VARCHAR(50) NOT NULL,
    image VARCHAR(500) NOT NULL,
    is_discounted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    brand VARCHAR(50) DEFAULT 'Unknown'
) ENGINE=InnoDB;

-- cart_items 테이블 (기존 코드 유지)
CREATE TABLE cart_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB;

-- orders 테이블 생성
CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    amount INT NOT NULL,
    order_name VARCHAR(255) NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_address VARCHAR(500) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- 주문 상태 (PENDING, COMPLETED, FAILED 등)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;


-- order_items 테이블 생성
CREATE TABLE order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    price_at_purchase INT NOT NULL, -- 구매 당시의 상품 가격
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB;


-- reviews 테이블 생성
CREATE TABLE reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nickname VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    image_url VARCHAR(255), -- imageUrl 필드 추가
    rating INT NOT NULL, -- rating 필드 추가 (1~5)
    product_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_reviews_product_id
        FOREIGN KEY (product_id) REFERENCES products (id)
        ON DELETE CASCADE
);
-- review_comments 테이블 생성 (Review와 1:N 관계)
CREATE TABLE review_comments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    review_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_review_comments_review_id
        FOREIGN KEY (review_id) REFERENCES reviews (id)
        ON DELETE CASCADE
);

-- 인덱스 추가 (조회 성능 최적화)
CREATE INDEX idx_category ON products (category);
CREATE INDEX idx_is_discounted ON products (is_discounted);
CREATE INDEX idx_user_id ON cart_items (user_id);
CREATE INDEX idx_order_user_id ON orders (user_id);
CREATE INDEX idx_order_status ON orders (status);
CREATE INDEX idx_order_item_order_id ON order_items (order_id);

-- 데이터 삽입
-- 기존 product 테이블 데이터
INSERT INTO products (name, description, price, stock, category, image, is_discounted)
VALUES
-- bats (원본 이미지 URL 유지)
('골드 G-임팩트 블랙 알루미늄배트', '고급 야구배트', 221000, 13, 'bats', 'http://yayongsa.hgodo.com/data/goods/18/11/46//20012/20012_main_010.jpg', FALSE),
('프랭클린 VENOM 1100 알루미늄배트(25") 24508', '고급 야구배트', 225000, 7, 'bats', 'http://yayongsa.hgodo.com/data/goods/22/08/31/42570/42570_main_036.jpg', FALSE),
('스톰 2022 폭풍 화이트에디션 배트', '고급 야구배트', 222000, 5, 'bats', 'http://yayongsa.hgodo.com/data/goods/21/07/29/40063/40063_main_061.jpg', FALSE),
('와니엘 고성능 프리미엄 라인 디아멍 스텔스 풀카본 야구배트 (블랙)', '고급 야구배트', 200000, 9, 'bats', 'http://yayongsa.hgodo.com/data/goods/21/12/50/41092/41092_main_0100.png', FALSE),
('웨이트레이드 2021 불도끼 알로이배트', '고급 야구배트', 365000, 5, 'bats', 'http://yayongsa.hgodo.com/data/goods/21/03/11/39195/39195_main_011.jpg', FALSE),
('5TOOLS SAND PAINTING 풀알로이 원피스 야구배트 (블루)', '고급 야구배트', 185000, 14, 'bats', 'http://yayongsa.hgodo.com/data/goods/21/01/03/38743/38743_main_011.jpg', FALSE),
('어나더레벨 카이저 -5드롭 알로이배트[#]', '고급 야구배트', 369000, 18, 'bats', 'http://yayongsa.hgodo.com/data/goods/20/11/45//37660/37660_main_073.png', FALSE),
('본 BON PRO 오더 하드 메이플 나무배트 (내츄럴/블랙/골드로고)', '고급 야구배트', 380000, 8, 'bats', 'http://yayongsa.hgodo.com/data/goods/25/01/02/48067/48067_main_078.png', FALSE),
('본 BON PRO 오더 하드 메이플 나무배트 (블랙/골드로고)', '고급 야구배트', 279000, 14, 'bats', 'http://yayongsa.hgodo.com/data/goods/25/01/02/48066/48066_main_055.png', FALSE),
('본 BON PRO 오더 하드 메이플 나무배트 (내츄럴/골드로고)', '고급 야구배트', 284000, 8, 'bats', 'http://yayongsa.hgodo.com/data/goods/25/01/02/48065/48065_main_073.png', FALSE),

-- 배팅장갑 (할인 안 됨)
('BBK BG395-25 배팅장갑 (레드)', '프리미엄 소재로 제작된 배팅장갑', 50000, 20, 'batting-gloves', 'http://yayongsa.hgodo.com/data/goods/25/03/11/48470/48470_main_037.jpg', FALSE),
('미즈노 프로 배팅장갑 26009 (검곤)', '미끄럼 방지 설계의 프로용 장갑', 55000, 15, 'batting-gloves', 'http://yayongsa.hgodo.com/data/goods/25/03/10/48406/48406_main_042.jpg', FALSE),
('미즈노 프로 배팅장갑 53701 (흰실)', '내구성이 뛰어난 흰색 장갑', 60000, 18, 'batting-gloves', 'http://yayongsa.hgodo.com/data/goods/24/12/49/47902/47902_main_079.jpg', FALSE),
('하타케야마 배팅장갑 블랙/골드', '블랙과 골드 컬러의 고급 장갑', 65000, 12, 'batting-gloves', 'http://yayongsa.hgodo.com/data/goods/24/11/48/47892/47892_main_085.png', FALSE),
('제트 배팅장갑 BGK-351 (화이트/블루)', '화이트와 블루의 스타일리시 장갑', 52000, 25, 'batting-gloves', 'http://yayongsa.hgodo.com/data/goods/24/11/45/47763/47763_main_090.jpg', FALSE),
('제트 배팅장갑 BGK-341 (화이트/그린)', '통기성이 좋은 그린 컬러 장갑', 53000, 22, 'batting-gloves', 'http://yayongsa.hgodo.com/data/goods/24/11/45/47759/47759_main_034.jpg', FALSE),
('프랭클린 NEW 2ND SKINZ DRIP (21741) 배팅장갑 화이트/레드', '레드와 화이트의 드립 디자인 장갑', 58000, 20, 'batting-gloves', 'http://yayongsa.hgodo.com/data/goods/24/10/42/47504/47504_main_099.jpg', FALSE),
('미즈노 윌드라이브 배팅장갑 53362 (적골)', '적색과 골드의 내구성 장갑', 57000, 15, 'batting-gloves', 'http://yayongsa.hgodo.com/data/goods/24/08/31/47075/47075_main_089.jpg', FALSE),
('프랭클린 CFX 커스텀오더 배팅장갑 (마시멜로우) -무료배번마킹', '마시멜로우 컬러의 커스텀 장갑', 62000, 10, 'batting-gloves', 'http://yayongsa.hgodo.com/data/goods/24/07/29/46928/46928_main_013.png', FALSE),
('스톰 NEW 고급형 배팅장갑-네이비블루', '네이비블루의 고급 장갑', 54000, 18, 'batting-gloves', 'http://yayongsa.hgodo.com/data/goods/21/06/25/39825/39825_main_057.jpg', FALSE),
('미즈노 모션아크 배팅장갑 21501[흰]', '흰색의 유연한 장갑', 56000, 20, 'batting-gloves', 'http://yayongsa.hgodo.com/data/goods/21/06/24/39773/39773_main_033.jpg', FALSE),
('제트 BGK-507 배팅장갑 (검/검)', '검정 컬러의 견고한 장갑', 51000, 25, 'batting-gloves', 'http://yayongsa.hgodo.com/data/goods/20/05/20//35613/register_main_060.jpg', FALSE),
('미즈노 셀렉나인 배팅장갑 04414 곤', '곤색의 실용적인 장갑', 59000, 15, 'batting-gloves', 'http://yayongsa.hgodo.com/data/goods/20/04/16//35409/register_main_055.jpg', FALSE),
-- 보호장비
('스톰 프리미엄 지투 가드_(레드/옐로우)', '야구 보호 장비', 45000, 15, 'protection', 'http://yayongsa.hgodo.com/data/goods/25/02/08/48342/48342_main_02.jpg', FALSE),
('스톰 프리미엄 지투 가드_(스카이블루/핑크)', '야구 보호 장비', 45000, 12, 'protection', 'http://yayongsa.hgodo.com/data/goods/25/02/08/48338/48338_main_046.jpg', FALSE),
('이보쉴드 WB5760501 X-SRZ PATRIOT 싱글스트랩 암가드', '야구 암가드', 55000, 10, 'protection', 'http://yayongsa.hgodo.com/data/goods/24/12/49/47925/47925_main_068.png', FALSE),
('제트 BHLK-80 (1100) 검투사 양귀 타자헬멧 (좌타자/화이트)', '야구 타자 헬멧', 85000, 8, 'protection', 'http://yayongsa.hgodo.com/data/goods/24/11/48/47890/47890_main_019.jpg', FALSE),
('제트 BHLK-80 (2500) 검투사 양귀 타자헬멧 (우타자/블루)', '야구 타자 헬멧', 85000, 9, 'protection', 'http://yayongsa.hgodo.com/data/goods/24/11/48/47887/47887_main_046.jpg', FALSE),
('제트 BHLK-80 (6400) 검투사 양귀 타자헬멧 (우타자/레드)', '야구 타자 헬멧', 85000, 7, 'protection', 'http://yayongsa.hgodo.com/data/goods/24/11/48/47885/47885_main_028.jpg', FALSE),
('나이키 조던 플라이 손등 핸드가드 (화이트)', '야구 손등 가드', 35000, 14, 'protection', 'http://yayongsa.hgodo.com/data/goods/24/11/47/47834/47834_main_038.jpg', FALSE),
('제트 BHLK-80 (1900) 검투사 양귀 타자헬멧 (좌타자/블랙)', '야구 타자 헬멧', 85000, 6, 'protection', 'http://yayongsa.hgodo.com/data/goods/24/11/46/47784/47784_main_098.jpg', FALSE),
('이보쉴드 WB5756101 X-SRZ MLB팀 에디션 싱글스트랩 암가드 (텍사스)', '야구 암가드', 60000, 11, 'protection', 'http://yayongsa.hgodo.com/data/goods/24/07/27/46879/46879_main_083.jpeg', FALSE),
('이보쉴드 WB5749301 X-SRZ MLB팀 에디션 싱글스트랩 암가드 (피츠버그)', '야구 암가드', 60000, 10, 'protection', 'http://yayongsa.hgodo.com/data/goods/24/07/27/46873/46873_main_048.jpeg', FALSE),
('제트 풋가드 BAGK-75 (골드/블랙)', '야구 풋가드', 40000, 13, 'protection', 'http://yayongsa.hgodo.com/data/goods/24/07/27/46837/46837_main_038.jpg', FALSE),
('제트 풋가드 BAGK-75 (블랙/옐로우)', '야구 풋가드', 40000, 12, 'protection', 'http://yayongsa.hgodo.com/data/goods/24/07/27/46838/46838_main_098.jpg', FALSE),
('제트 어센틱 암가드 BAGK-47 김민수 모델 (화이트)', '야구 암가드', 50000, 9, 'protection', 'http://yayongsa.hgodo.com/data/goods/24/07/27/46803/46803_main_04.jpg', FALSE),
('미즈노 풋가드 23001 (화이트/우타용)', '야구 풋가드', 45000, 15, 'protection', 'http://yayongsa.hgodo.com/data/goods/24/05/21/46503/46503_main_080.jpg', FALSE),
('미즈노 풋가드 24009 (검)', '야구 풋가드', 45000, 14, 'protection', 'http://yayongsa.hgodo.com/data/goods/24/06/24/46594/46594_main_098.jpg', FALSE),
('이보쉴드 EVO XVT 2.0 WB5725604 타자헬멧 (무광블루)', '야구 타자 헬멧', 90000, 8, 'protection', 'http://yayongsa.hgodo.com/data/goods/24/04/14/46320/46320_main_030.jpeg', FALSE),
('이보쉴드 EVO XVT 2.0 WB5725603 타자헬멧 (무광네이비)', '야구 타자 헬멧', 90000, 7, 'protection', 'http://yayongsa.hgodo.com/data/goods/24/04/14/46319/46319_main_039.jpeg', FALSE),
('브렛 프로페셔널 프리미엄 경량 검투사 배팅헬멧 레드 무광 (우타자용)', '야구 타자 헬멧', 95000, 6, 'protection', 'http://yayongsa.hgodo.com/data/goods/24/02/06/45952/45952_main_081.jpg', FALSE),
('제트 손등가드 BLK-45 (빨강)', '야구 손등 가드', 35000, 10, 'protection', 'http://yayongsa.hgodo.com/data/goods/23/12/50/45630/45630_main_022.jpg', FALSE),
-- 글러브
('브라더 플래티늄에디션 포수미트 CB-840 (국대배색)', '고급 포수미트', 250000, 15, 'gloves', 'http://yayongsa.hgodo.com/data/goods/25/01/02/48046/48046_main_027.png', FALSE),
('제트 소프트스티어 BRCB35512 (1900) 포수미트 (블랙)', '고급 포수미트', 220000, 12, 'gloves', 'http://yayongsa.hgodo.com/data/goods/25/02/09/48350/48350_main_021.jpg', FALSE),
('제트 소프트스티어 BRCB35512 (3200) 포수미트 (파스텔브라운)', '고급 포수미트', 230000, 10, 'gloves', 'http://yayongsa.hgodo.com/data/goods/25/02/09/48351/48351_main_079.jpg', FALSE),
('브라더 플래티늄에디션 포수미트 CB-240 (블랙/레드)', '고급 포수미트', 240000, 14, 'gloves', 'http://yayongsa.hgodo.com/data/goods/25/01/02/48056/48056_main_015.png', FALSE),
('브라더 골드에디션 프로 포수미트 CB-860 (네이비/화이트)', '고급 포수미트', 260000, 8, 'gloves', 'http://yayongsa.hgodo.com/data/goods/25/01/01/48029/48029_main_055.png', FALSE),
('브라더 골드에디션 프로 포수미트 CB-840 (화이트/그린)', '고급 포수미트', 250000, 9, 'gloves', 'http://yayongsa.hgodo.com/data/goods/25/01/01/48027/48027_main_049.png', FALSE),
('스톰 2025년형 볼트 옐로우 시리즈 포수미트 일반형-블랙/화이트/레드', '고급 포수미트', 280000, 7, 'gloves', 'http://yayongsa.hgodo.com/data/goods/24/11/46/47822/47822_main_01.jpg', FALSE),
('스톰 2025년형 볼트 골드라벨 포수미트 일반형-블랙/화이트/레드', '고급 포수미트', 290000, 11, 'gloves', 'http://yayongsa.hgodo.com/data/goods/24/10/44/47630/47630_main_021.jpg', FALSE),
('윌슨 A2000 CLASSIC WBW1020741175 1975 내야글러브 (블랙)', '고급 내야글러브', 350000, 6, 'gloves', 'http://yayongsa.hgodo.com/data/goods/24/11/48/47865/47865_main_070.jpg', FALSE),
('윌슨 A500 WBW10254212 12인치 내야글러브 (네이비/블루)', '고급 내야글러브', 180000, 13, 'gloves', 'http://yayongsa.hgodo.com/data/goods/24/11/46/47769/47769_main_019.jpeg', FALSE),
('윌슨 A500 WBW102540115 11.5인치 내야글러브 (레드/블루)', '고급 내야글러브', 170000, 12, 'gloves', 'http://yayongsa.hgodo.com/data/goods/24/11/46/47771/47771_main_019.jpeg', FALSE),
('미즈노 프로 D-UP ZONE 복각 엠막 내야글러브 5071353 (오렌지)', '고급 내야글러브', 400000, 8, 'gloves', 'http://yayongsa.hgodo.com/data/goods/24/10/42/47505/47505_main_046.jpg', FALSE),
('윌슨 A2000 WBW10270512 엘리 데라크루즈 게임모델 내야글러브', '고급 내야글러브', 450000, 7, 'gloves', 'http://yayongsa.hgodo.com/data/goods/24/10/42/47498/47498_main_083.jpeg', FALSE),
('롤링스 MLB 어센틱 HOH 내야 글러브 트레아 터너모델 GH4PROTT (카멜/탄)', '고급 내야글러브', 420000, 9, 'gloves', 'http://yayongsa.hgodo.com/data/goods/24/10/40/47398/47398_main_092.jpg', FALSE),
('윌슨 JAPAN STAFF WBW101058 11.6인치 경식 내야글러브 (레드브라운)', '고급 내야글러브', 380000, 10, 'gloves', 'http://yayongsa.hgodo.com/data/goods/24/09/36/47326/47326_main_03.jpg', FALSE),
('프로-스펙스 스마트 원성준 선수모델 내야글러브 (화이트/블랙/레드)', '고급 내야글러브', 360000, 11, 'gloves', 'http://yayongsa.hgodo.com/data/goods/24/08/35/47284/47284_main_042.png', FALSE),
('스톰 2019년 풍운(風雲) 오일레더 내야 아이웹-브라운/카멜 [#]', '고급 내야글러브', 200000, 14, 'gloves', 'http://yayongsa.hgodo.com/data/goods/19/04/17//32411/register_main_010.jpg', FALSE),
('아식스 골드스테이지 BGH5LH 11.75 내야 글러브 BE', '고급 내야글러브', 390000, 6, 'gloves', 'http://yayongsa.hgodo.com/data/goods/19/05/18//32473/register_main_086.jpg', FALSE),
('브라더 클래식 프로 변형아이웹 내아글러브 (블루/탄)', '고급 내야글러브', 340000, 8, 'gloves', 'http://yayongsa.hgodo.com/data/goods/18/11/47//27886/27886_main_027.jpg', FALSE),
('제트 실버오더 시리즈 BPGK-26427 쌍십자웹 외야글러브 (화이트/블루)', '고급 외야글러브', 410000, 9, 'gloves', 'http://yayongsa.hgodo.com/data/goods/25/02/09/48361/48361_main_032.jpg', FALSE),
('제트 실버오더 시리즈 BPGK-26417 티벨트웹 외야글러브 (블랙/레드/화이트)', '고급 외야글러브', 400000, 10, 'gloves', 'http://yayongsa.hgodo.com/data/goods/25/02/09/48357/48357_main_026.jpg', FALSE),
('제트 네오스테이터스 BRGB31437F (3225) 티웹 외야글러브 (크림/블루)', '고급 외야글러브', 390000, 7, 'gloves', 'http://yayongsa.hgodo.com/data/goods/24/10/42/47522/47522_main_024.jpg', FALSE),
('롤링스 MLB 어센틱 HOH 외야 글러브 페르난도 타티스 주니어모델 GH4PROFT (핑크)', '고급 외야글러브', 450000, 6, 'gloves', 'http://yayongsa.hgodo.com/data/goods/24/10/40/47399/47399_main_070.jpg', FALSE),
('윌슨 A2000 WBW1027031275 스티븐 콴 게임모델 외야글러브', '고급 외야글러브', 460000, 8, 'gloves', 'http://yayongsa.hgodo.com/data/goods/24/10/42/47499/47499_main_0100.jpeg', FALSE),
('롤링스 MLB 어센틱 HOH 외야 글러브 크리스티안 옐리치모델 GH4PROCY (카멜/네이비)', '고급 외야글러브', 440000, 9, 'gloves', 'http://yayongsa.hgodo.com/data/goods/24/10/40/47393/47393_main_037.jpg', FALSE),
('다이아몬드 프로마제스틱 PM-108 이치로웹 외야글러브 (블루)', '고급 외야글러브', 370000, 11, 'gloves', 'http://yayongsa.hgodo.com/data/goods/24/06/26/46692/46692_main_018.jpg', FALSE),
('스톰 폭풍 프로 스페셜 이치로웹 외야 글러브 블랙 [#]', '고급 외야글러브', 320000, 12, 'gloves', 'http://yayongsa.hgodo.com/data/goods/18/11/47//28048/modify_main_019.jpg', FALSE),
('브라더 BPBL-004 프리미엄 라인 플래티넘 13인치 외야 글러브 뉴이치로웹 블루 좌완(오른손착용) (#)', '고급 외야글러브', 380000, 10, 'gloves', 'http://yayongsa.hgodo.com/data/goods/18/11/47//28057/modify_main_04.jpg', FALSE),
('벨가드 프로 외야 글러브 13인치 블랙/화이트 [#]', '고급 외야글러브', 350000, 13, 'gloves', 'http://yayongsa.hgodo.com/data/goods/18/11/46//18553/register_main_090.jpg', FALSE),
('미즈노 프로 A에디션 한정판 외야글러브 22007(곤)', '고급 외야글러브', 430000, 7, 'gloves', 'http://yayongsa.hgodo.com/data/goods/23/05/20/44468/44468_main_027.jpg', FALSE),
('미즈노 프로 A에디션 한정판 외야글러브 22007(적)', '고급 외야글러브', 430000, 6, 'gloves', 'http://yayongsa.hgodo.com/data/goods/23/05/20/44467/44467_main_024.jpg', FALSE),
('윌슨 A2000 WBW100112 1799SS 12.75인치 외야글러브 [#]', '고급 외야글러브', 400000, 8, 'gloves', 'http://yayongsa.hgodo.com/data/goods/21/02/05//38912/38912_main_094.jpg', FALSE),
('SSK 나인온나인 샵오더 글러브 네이비/레드 외야이치로웹 좌완 [#]', '고급 외야글러브', 410000, 9, 'gloves', 'http://yayongsa.hgodo.com/data/goods/20/01/05/34649/34649_main_041.jpg', FALSE),
('그놈의야구 GN글러브(난공불락) 1.5등급 외야글러브 13인치 이치로웹 레드 [#]', '고급 외야글러브', 360000, 10, 'gloves', 'http://yayongsa.hgodo.com/data/goods/19/09/39//33574/33574_main_050.jpg', FALSE),
('롤링스 HOH 스폐셜메이크업 GH4WXHDDCT 1루미트 RY/W (블루)', '고급 1루미트', 300000, 12, 'gloves', 'http://yayongsa.hgodo.com/data/goods/25/01/04/48179/48171_main_078.jpg', FALSE),
('롤링스 HOH 스폐셜메이크업 GH4WXHDDCT 1루미트 SC/B (레드/블랙)', '고급 1루미트', 310000, 11, 'gloves', 'http://yayongsa.hgodo.com/data/goods/25/01/04/48148/48148_main_03.jpg', FALSE),
('롤링스 프로프리퍼드 MLB 프레디 프리먼 어센틱 GH4PROSFF 1루미트', '고급 1루미트', 450000, 7, 'gloves', 'http://yayongsa.hgodo.com/data/goods/24/11/45/47732/47732_main_074.jpg', FALSE),
('SSK JAPAN CATALOG PROEDGE GLOVE PEKF13024F 경식 1루미트 (브라운)', '고급 1루미트', 340000, 9, 'gloves', 'http://yayongsa.hgodo.com/data/goods/24/08/34/47226/47226_main_090.jpg', FALSE),
('SSK PROEDGE SPECIAL EDITION 프로엣지 경식 1루미트 (Blue SE2505)', '고급 1루미트', 350000, 8, 'gloves', 'http://yayongsa.hgodo.com/data/goods/24/10/42/47531/47531_main_062.png', FALSE),
('미즈노 프로 BSS HAGA 스페셜오더 TK패턴 12.5 1루미트 (블랙/탄)', '고급 1루미트', 420000, 6, 'gloves', 'http://yayongsa.hgodo.com/data/goods/24/05/18/46435/46435_main_011.png', FALSE),
('윌슨 A1000 WBW101452 1620 1루미트 (실버/블랙)', '고급 1루미트', 280000, 10, 'gloves', 'http://yayongsa.hgodo.com/data/goods/24/03/12/46220/46220_main_043.jpeg', FALSE),
('제트 프로스테이터스 스페셜에디션 BPROFM03S 5600 1루미트 오렌지 우완 [#]', '고급 1루미트', 330000, 11, 'gloves', 'http://yayongsa.hgodo.com/data/goods/20/02/09//34917/register_main_044.jpg', FALSE),
('44 SY-023 1루미트 \'크로커다일\'', '고급 1루미트', 200000, 13, 'gloves', 'http://yayongsa.hgodo.com/data/goods/20/03/10//34951/34951_main_041.jpg', FALSE),
('제트 BPFK-1583P 1루미트', '고급 1루미트', 250000, 12, 'gloves', 'http://yayongsa.hgodo.com/data/goods/19/03/12//31285/31285_main_040.jpg', FALSE),
('스톰 2019년 운(雲) 1루미트-블루/레드', '고급 1루미트', 220000, 14, 'gloves', 'http://yayongsa.hgodo.com/data/goods/19/05/19//32493/register_main_094.jpg', FALSE),
('롤링스 HOH 스폐셜메이크업 GH4WXHD 206-12 올라운드글러브 CB/TAN (C블루/탄)', '고급 올라운드글러브', 370000, 9, 'gloves', 'http://yayongsa.hgodo.com/data/goods/25/03/11/48443/48443_main_029.jpg', FALSE),
('롤링스 HOH 스폐셜메이크업 GH4WXHD 206-9 올라운드글러브 CAM/TAN (카멜/탄)', '고급 올라운드글러브', 360000, 10, 'gloves', 'http://yayongsa.hgodo.com/data/goods/25/03/11/48434/48434_main_099.jpg', FALSE),
('롤링스 HOH 스폐셜메이크업 GH4WXHD 206-9 올라운드글러브 B/SC (블랙/레드)', '고급 올라운드글러브', 350000, 11, 'gloves', 'http://yayongsa.hgodo.com/data/goods/25/03/11/48426/48426_main_02.jpg', FALSE),
('롤링스 HOH 스폐셜메이크업 GH4WXHD 206-12 투수글러브 RY/W (블루)', '고급 투수글러브', 340000, 12, 'gloves', 'http://yayongsa.hgodo.com/data/goods/25/01/04/48175/48175_main_035.jpg', FALSE),
('롤링스 HOH 스폐셜메이크업 GH4WXHD 206-9 투수글러브 B (블랙)', '고급 투수글러브', 330000, 13, 'gloves', 'http://yayongsa.hgodo.com/data/goods/25/01/04/48167/48167_main_08.jpg', FALSE),
-- 야구화
('GN NEW 트레이닝슈즈 인조잔디화 (민트/오렌지)', '인조잔디용 트레이닝화', 55000, 15, 'shoes', 'http://yayongsa.hgodo.com/data/goods/24/10/42/47477/47477_main_015.jpg', FALSE),
('뉴발란스 T4040 SW7 인조잔디화 (화이트)', '인조잔디용 트레이닝화', 60000, 12, 'shoes', 'http://yayongsa.hgodo.com/data/goods/23/09/37/45193/45193_main_058.jpg', FALSE),
('아식스 NEOREVIVE TR2 인조잔디화 1123A015 112 (화이트/레드)', '인조잔디용 트레이닝화', 58000, 10, 'shoes', 'http://yayongsa.hgodo.com/data/goods/23/03/11/43958/43958_main_080.jpg', FALSE),
('아식스 NEOREVIVE TR2 인조잔디화 1123A015 111 (화이트/네이비)', '인조잔디용 트레이닝화', 47000, 14, 'shoes', 'http://yayongsa.hgodo.com/data/goods/23/03/11/43957/43957_main_099.jpg', FALSE),
('미즈노 인조잔디화 222000 (블랙)', '인조잔디용 트레이닝화', 82000, 13, 'shoes', 'http://yayongsa.hgodo.com/data/goods/23/01/02/43560/43560_main_014.jpg', FALSE),
('미즈노 인조잔디화 222001 (화이트)', '인조잔디용 트레이닝화', 83000, 11, 'shoes', 'http://yayongsa.hgodo.com/data/goods/23/01/02/43559/43559_main_061.jpg', FALSE),
('강스 스튜디오 잭팟2 밸크로 터프 인조잔디화 JPT2-J03 (화이트/네이비)', '인조잔디용 트레이닝화', 32000, 9, 'shoes', 'http://yayongsa.hgodo.com/data/goods/24/02/07/46028/46028_main_092.jpg', FALSE),
('프로스펙스 엘리트 인조잔디화 (화이트네이비)', '인조잔디용 트레이닝화', 25000, 8, 'shoes', 'http://yayongsa.hgodo.com/data/goods/24/03/11/46187/46187_main_011.jpg', FALSE),
('제트 인조잔디화 BSR-8818K (1153) 화이트/골드', '인조잔디용 트레이닝화', 54000, 10, 'shoes', 'http://yayongsa.hgodo.com/data/goods/23/11/44/45419/45419_main_050.jpg', FALSE),
('강스 스튜디오 잭팟2 터프 인조잔디화 JPT2-J11 (민트/네이비)', '인조잔디용 트레이닝화', 30000, 12, 'shoes', 'http://yayongsa.hgodo.com/data/goods/25/01/03/48118/48118_main_026.jpg', FALSE),
('크라운비 SWEEP2 인조잔디화 화이트/네이비', '인조잔디용 트레이닝화', 78000, 13, 'shoes', 'http://yayongsa.hgodo.com/data/goods/21/08/33/40345/40345_main_035.jpg', FALSE),
('언더아머 인조잔디화 3025593 001(블랙)', '인조잔디용 트레이닝화', 49000, 11, 'shoes', 'http://yayongsa.hgodo.com/data/goods/22/09/39/42933/42933_main_070.jpg', FALSE);

-- discounted_products 데이터 삽입 (is_discounted = true로 설정)
INSERT INTO products (name, description, price, original_price, discount_percent, stock, category, image, is_discounted)
VALUES
-- bats (원본 이미지 URL 유지)
('윌슨 드마리니 WTDXVB5 VOODOO 밸런스 알루미늄 야구배트 (실버)[#]', '고급 야구배트', 232280, 314000, 26, 8, 'bats', 'http://yayongsa.hgodo.com/data/goods/20/09/40//37311/register_main_041.jpg', TRUE),
('에이뉴우 CrazyRuth -5 -6드롭 (진동흡수장치포함) 크레이지루스 스칸디늄 알루미늄배트', '고급 야구배트', 281200, 296000, 5, 6, 'bats', 'http://yayongsa.hgodo.com/data/goods/21/05/19/39551/39551_main_046.jpg', TRUE),
('MAZOR 2024 악셀 민트 탑 밸런스 알로이배트 (KBN 1.21 인증)', '고급 야구배트', 167450, 197000, 15, 13, 'bats', 'http://yayongsa.hgodo.com/data/goods/24/02/08/46062/46062_main_061.jpg', TRUE),
('이스턴 2021 B5 프로 빅배럴 원피스 알로이 야구배트 -5드롭', '고급 야구배트', 168820, 194000, 13, 16, 'bats', 'http://yayongsa.hgodo.com/data/goods/21/03/10/39168/39168_main_055.jpg', TRUE),
('프랭클린 VENOM 1200 알루미늄배트(25") 24516', '고급 야구배트', 315870, 347000, 9, 8, 'bats', 'http://yayongsa.hgodo.com/data/goods/22/08/31/42571/42571_main_056.jpg', TRUE),
('MAZOR 이그나이트 화이트/블랙 에디션 CU-31 알로이배트 (1.21KBN인증)', '고급 야구배트', 240270, 329000, 27, 9, 'bats', 'http://yayongsa.hgodo.com/data/goods/23/03/13/44089/44089_main_078.jpg', TRUE),
('데상트 S8126WEQ01 BKYE 투피스 하이브리드 배트', '고급 야구배트', 290920, 338000, 14, 10, 'bats', 'http://yayongsa.hgodo.com/data/goods/23/02/08/43839/43839_main_029.jpg', TRUE),
('어나더레벨 팬텀 -5 빅배럴 1.21인증 알로이배트 [#]', '고급 야구배트', 149080, 204000, 27, 14, 'bats', 'http://yayongsa.hgodo.com/data/goods/20/10/42//37338/register_main_072.jpg', TRUE),
('MAZOR 이그나이트 블랙/골드 에디션 CU-31 알로이배트', '고급 야구배트', 237360, 258000, 8, 16, 'bats', 'http://yayongsa.hgodo.com/data/goods/23/03/13/44091/44091_main_055.jpg', TRUE),
('녹스 TITANX 알로이 -5드랍 1.21 인증배트', '고급 야구배트', 215600, 245000, 12, 15, 'bats', 'http://yayongsa.hgodo.com/data/goods/24/04/17/46425/46425_main_096.png', TRUE),
-- 배팅장갑 (할인 됨, 10개)
('미즈노 프로 배팅장갑 26062 (적실)', '적색 실링 디자인의 프로 장갑', 44000, 55000, 20, 15, 'batting-gloves', 'http://yayongsa.hgodo.com/data/goods/25/03/10/48407/48407_main_055.jpg', TRUE),
('미즈노 프로 A51 배팅장갑 51014 (곤실)', '곤색 실링의 고급 장갑', 48000, 60000, 20, 12, 'batting-gloves', 'http://yayongsa.hgodo.com/data/goods/24/10/41/47443/47443_main_090.jpg', TRUE),
('미즈노 프로 배팅장갑 53861(적회)', '적회 컬러의 내구성 장갑', 51000, 65000, 22, 10, 'batting-gloves', 'http://yayongsa.hgodo.com/data/goods/24/09/36/47303/47303_main_063.jpg', TRUE),
('프랭클린 CFX 커스텀오더 배팅장갑 오징어게임 456', '456 디자인의 독특한 장갑', 54000, 68000, 20, 8, 'batting-gloves', 'http://yayongsa.hgodo.com/data/goods/22/05/19/41841/41841_main_092.png', TRUE),
('44 스페셜오더 BG #11 배팅장갑 [딸기우유]', '딸기우유 컬러의 특별 장갑', 45000, 60000, 25, 15, 'batting-gloves', 'http://yayongsa.hgodo.com/data/goods/20/06/26//35956/register_main_051.jpg', TRUE),
('도쿠마 프로 골드에디션 배팅장갑 골드/네이비', '골드와 네이비의 고급 장갑', 52000, 65000, 20, 10, 'batting-gloves', 'http://yayongsa.hgodo.com/data/goods/20/05/20//35606/35606_main_046.jpg', TRUE),
('골드 GOLD 배팅장갑 (레드)', '레드 컬러의 고급 장갑', 48000, 60000, 20, 12, 'batting-gloves', 'http://yayongsa.hgodo.com/data/goods/21/12/51/41106/41106_main_084.jpg', TRUE),
('언더아머 클린업 21 컬쳐 배팅장갑 1365468 001[검노]', '검정과 노랑의 스타일리시 장갑', 55000, 70000, 21, 10, 'batting-gloves', 'http://yayongsa.hgodo.com/data/goods/21/08/33/40319/40319_main_091.jpg', TRUE),
('프랭클린 CFX 커스텀오더 배팅장갑 오징어게임 핑크솔져', '핑크솔져 디자인의 독특한 장갑', 53000, 67000, 21, 8, 'batting-gloves', 'http://yayongsa.hgodo.com/data/goods/22/05/19/41842/41842_main_088.png', TRUE),
-- 보호장비
('모리모토 플루어레선트 야구 타자 암가드 (옐로우)', '야구 암가드', 42000, 50000, 16, 12, 'protection', 'http://yayongsa.hgodo.com/data/goods/23/05/20/44440/44440_main_053.png', TRUE),
('크라운비 NC 천재환 선수모델 암가드 (실버/네이비)', '야구 암가드', 48000, 60000, 20, 9, 'protection', 'http://yayongsa.hgodo.com/data/goods/23/05/20/44432/44432_main_073.png', TRUE),
('브렛 프로페셔널 프리미엄 경량 검투사 배팅헬멧 블랙무광 (좌타자용)', '야구 타자 헬멧', 76000, 95000, 20, 8, 'protection', 'http://yayongsa.hgodo.com/data/goods/23/04/17/44214/44208_main_014.jpg', TRUE),
('브렛 프로페셔널 프리미엄 경량 검투사 배팅헬멧 블랙무광 (우타자용)', '야구 타자 헬멧', 76000, 95000, 20, 7, 'protection', 'http://yayongsa.hgodo.com/data/goods/23/04/17/44215/44209_main_095.jpg', TRUE),
('하타케야마 포수장비세트 프로사양 (네이비+실버+옐로우)', '야구 포수 장비', 250000, 300000, 16, 5, 'protection', 'http://yayongsa.hgodo.com/data/goods/24/10/44/47641/47641_main_03.png', TRUE),
('하타케야마 포수장비세트 프로사양 (블루+화이트+레드)', '야구 포수 장비', 260000, 320000, 18, 4, 'protection', 'http://yayongsa.hgodo.com/data/goods/24/10/44/47640/47640_main_058.png', TRUE),
('제트 포수장비 세트 BLMP PRO (YEJ) 1900-블랙/골드', '야구 포수 장비', 270000, 330000, 18, 6, 'protection', 'http://yayongsa.hgodo.com/data/goods/24/10/42/47495/47495_main_03.jpg', TRUE),
('엑스필더 초경량 국산 티타늄 포수 마스크 (화이트/네이비)', '야구 포수 마스크', 120000, 150000, 20, 10, 'protection', 'http://yayongsa.hgodo.com/data/goods/24/07/31/47037/47037_main_098.jpg', TRUE),
('엑스필더 국내산 고급형 포수장비세트 (포스)', '야구 포수 장비', 280000, 350000, 20, 5, 'protection', 'http://yayongsa.hgodo.com/data/goods/24/06/25/46651/46651_main_049.jpg', TRUE),
('엑스필더 국내산 고급형 포수장비세트 (레즈)', '야구 포수 장비', 280000, 350000, 20, 4, 'protection', 'http://yayongsa.hgodo.com/data/goods/24/06/25/46650/46650_main_097.jpg', TRUE),
-- 글러브
('하타케야마 샵오더 M8 프로오더 포수미트 (블루/화이트)', '고급 포수미트', 320000, 400000, 20, 8, 'gloves', 'http://yayongsa.hgodo.com/data/goods/24/08/35/47261/47261_main_056.jpg', TRUE),
('스톰 2025년형 볼트 골드라벨 1루미트 일반형-화이트/블랙/탄', '고급 1루미트', 240000, 300000, 20, 10, 'gloves', 'http://yayongsa.hgodo.com/data/goods/24/10/44/47617/47617_main_01.jpg', TRUE),
('프로-스펙스 스마트 이호성 선수모델 투수글러브 (블랙)', '고급 투수글러브', 280000, 350000, 20, 9, 'gloves', 'http://yayongsa.hgodo.com/data/goods/24/10/43/47557/47557_main_025.png', TRUE),
('제트 네오스테이터스 BRGB31421F (3219) 철판웹 투수글러브 (크림/블랙)', '고급 투수글러브', 300000, 375000, 20, 7, 'gloves', 'http://yayongsa.hgodo.com/data/goods/24/10/42/47512/47512_main_011.jpg', TRUE),
('윌슨 KOREA A2K WTA2K24KRZZNV 투수올라운드글러브 (네이비)', '고급 투수글러브', 480000, 600000, 20, 6, 'gloves', 'http://yayongsa.hgodo.com/data/goods/24/09/39/47374/47374_main_016.jpg', TRUE),
('프로-스펙스 스마트 양지율 선수모델B 투수글러브 (네이비/화이트)', '고급 투수글러브', 290000, 360000, 19, 8, 'gloves', 'http://yayongsa.hgodo.com/data/goods/24/07/30/47010/47010_main_066.jpg', TRUE),
('윌슨 KOREA A2K WTA2K24KRB2BLR B2 투수올라운드글러브 (블루)', '고급 투수글러브', 500000, 625000, 20, 5, 'gloves', 'http://yayongsa.hgodo.com/data/goods/24/08/35/47280/47280_main_038.jpg', TRUE),
('다비드 PA KY(RB/YE)24 임기영 선수모델 투수글러브', '고급 투수글러브', 310000, 380000, 18, 9, 'gloves', 'http://yayongsa.hgodo.com/data/goods/24/07/29/46934/46934_main_044.jpg', TRUE),
('다비드 PA JM(PP/HO)24 강재민 선수모델 투수글러브', '고급 투수글러브', 300000, 370000, 19, 10, 'gloves', 'http://yayongsa.hgodo.com/data/goods/24/07/28/46902/46902_main_057.jpg', TRUE),
('44 SH-061 투수올라운드 글러브 (하늘)', '고급 투수글러브', 180000, 225000, 20, 11, 'gloves', 'http://yayongsa.hgodo.com/data/goods/24/07/28/46889/46889_main_011.jpg', TRUE),

-- 야구화
('SSK Ultra Flexible 포인트화 SSF4200BL (화이트/네이비)', '인조잔디용 포인트화', 72000, 90000, 20, 10, 'shoes', 'http://yayongsa.hgodo.com/data/goods/25/01/04/48180/48180_main_021.png', TRUE),
('GN NEW 트레이닝슈즈 인조잔디화 (화이트/골드)', '인조잔디용 트레이닝화', 68000, 85000, 20, 9, 'shoes', 'http://yayongsa.hgodo.com/data/goods/24/10/42/47463/47463_main_02.jpg', TRUE),
('SSK 인조잔디화 SSF5200 (WHITE / NAVY)', '인조잔디용 트레이닝화', 70000, 88000, 20, 8, 'shoes', 'http://yayongsa.hgodo.com/data/goods/23/08/31/45047/45047_main_030.png', TRUE),
('미즈노 버디 일체형징야구화 232101 (흰)', '인조잔디용 트레이닝화', 64000, 80000, 20, 12, 'shoes', 'http://yayongsa.hgodo.com/data/goods/23/03/10/43908/43908_main_097.jpg', TRUE),
('미즈노 포인트 인조잔디화 242001(흰)', '인조잔디용 트레이닝화', 65000, 82000, 20, 11, 'shoes', 'http://yayongsa.hgodo.com/data/goods/24/02/05/45941/45941_main_062.jpg', TRUE),
('골드이스트 플래쉬 인조잔디화 (네이비/화이트/레드)', '인조잔디용 트레이닝화', 67000, 84000, 20, 7, 'shoes', 'http://yayongsa.hgodo.com/data/goods/24/11/45/47722/47722_main_040.jpg', TRUE),
('강스 스튜디오 잭팟2 터프 인조잔디화 JPT2-J06 (옐로우/네이비)', '인조잔디용 트레이닝화', 69000, 86000, 19, 10, 'shoes', 'http://yayongsa.hgodo.com/data/goods/25/01/03/48113/48113_main_034.jpg', TRUE),
('아식스 NEOREVIVE TR SFT144 100 인조잔디화 화이트/실버', '인조잔디용 트레이닝화', 71000, 89000, 20, 9, 'shoes', 'http://yayongsa.hgodo.com/data/goods/18/11/46//19827/register_main_023.jpg', TRUE),
('미즈노 포인트인조잔디화 192214[흰곤]', '인조잔디용 트레이닝화', 66000, 83000, 20, 8, 'shoes', 'http://yayongsa.hgodo.com/data/goods/20/03/14//35109/register_main_034.jpg', TRUE),
('아디다스 아디스타트 TPU MID G20363 포인트화', '인조잔디용 포인트화', 75000, 94000, 20, 10, 'shoes', 'http://yayongsa.hgodo.com/data/goods/18/11/46//19810/19810_main_013.jpg', TRUE);

-- 할인 가격 검증 (price = original_price * (1 - discount_percent/100)와 일치하는지 확인)
UPDATE products
SET price = ROUND(original_price * (1 - discount_percent / 100.0))
WHERE is_discounted = TRUE AND original_price IS NOT NULL AND discount_percent IS NOT NULL;




-- 필터링
UPDATE products
SET brand = CASE
    WHEN name LIKE '골드%' THEN '골드'
    WHEN name LIKE '프랭클린%' THEN '프랭클린'
    WHEN name LIKE '스톰%' THEN '스톰'
    WHEN name LIKE '와니엘%' THEN '와니엘'
    WHEN name LIKE '웨이트레이드%' THEN '웨이트레이드'
    WHEN name LIKE '5TOOLS%' THEN '5TOOLS'
    WHEN name LIKE '어나더레벨%' THEN '어나더레벨'
    WHEN name LIKE '본%' THEN '본'
    WHEN name LIKE 'BBK%' THEN 'BBK'
    WHEN name LIKE '미즈노%' THEN '미즈노'
    WHEN name LIKE '하타케야마%' THEN '하타케야마'
    WHEN name LIKE '제트%' THEN '제트'
    WHEN name LIKE '이보쉴드%' THEN '이보쉴드'
    WHEN name LIKE '나이키%' THEN '나이키'
    WHEN name LIKE '브라더%' THEN '브라더'
    WHEN name LIKE '윌슨%' THEN '윌슨'
    WHEN name LIKE '롤링스%' THEN '롤링스'
    WHEN name LIKE '아식스%' THEN '아식스'
    WHEN name LIKE '프로-스펙스%' THEN '프로-스펙스'
    WHEN name LIKE '다이아몬드%' THEN '다이아몬드'
    WHEN name LIKE '벨가드%' THEN '벨가드'
    WHEN name LIKE 'SSK%' THEN 'SSK'
    WHEN name LIKE '그놈의야구%' THEN '그놈의야구'
    WHEN name LIKE '44%' THEN '44'
    WHEN name LIKE '에이뉴우%' THEN '에이뉴우'
    WHEN name LIKE 'MAZOR%' THEN 'MAZOR'
    WHEN name LIKE '이스턴%' THEN '이스턴'
    WHEN name LIKE '데상트%' THEN '데상트'
    WHEN name LIKE '녹스%' THEN '녹스'
    WHEN name LIKE '도쿠마%' THEN '도쿠마'
    WHEN name LIKE '골드이스트%' THEN '골드이스트'
    WHEN name LIKE '언더아머%' THEN '언더아머'
    WHEN name LIKE '모리모토%' THEN '모리모토'
    WHEN name LIKE '크라운비%' THEN '크라운비'
    WHEN name LIKE '브렛%' THEN '브렛'
    WHEN name LIKE '엑스필더%' THEN '엑스필더'
    WHEN name LIKE '프로스펙스%' THEN '프로스펙스'
    WHEN name LIKE '강스%' THEN '강스'
    WHEN name LIKE '뉴발란스%' THEN '뉴발란스'
    WHEN name LIKE 'GN%' THEN 'GN'
    WHEN name LIKE '아디다스%' THEN '아디다스'
     WHEN name LIKE '다비드%' THEN '다비드'
    ELSE 'Unknown'
END;


