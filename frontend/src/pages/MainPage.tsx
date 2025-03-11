import { useEffect, useState } from "react";
import { Container, Typography, Button, Box, Card, CardContent, CardMedia } from "@mui/material";
import { Link } from "react-router-dom";
import axios from "axios";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Product } from "../types";

interface DiscountedProduct {
  id: number;
  name: string;
  description: string;
  originalPrice: number;
  discountPercent: number;
  category: string;
  imageUrl: string;
}

export default function MainPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:8092/api/products");
        console.log("API 데이터:", res.data);
        setProducts(res.data);
        setError(null);
      } catch (err) {
        console.error("상품 목록 불러오기 오류:", err);
        setError("상품을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  const sliderImages = [
    "https://cdn-pro-web-213-28.cdn-nhncommerce.com/yayongsa11_godomall_com/data/skin/front/designbook_thegrandR/img/banner/b028cd1af60d8b4d77044205c8d7ffd5_41549.jpg",
    "https://cdn-pro-web-213-28.cdn-nhncommerce.com/yayongsa11_godomall_com/data/skin/front/designbook_thegrandR/img/banner/a3f17675fc39136bb73107ff7d60183f_24881.png",
    "https://cdn-pro-web-213-28.cdn-nhncommerce.com/yayongsa11_godomall_com/data/skin/front/designbook_thegrandR/img/banner/fde30ff57202cd01e4bebeed15a1d871_15876.jpg",
  ];

  // Dummy discounted products data
  const discountedProducts: DiscountedProduct[] = [
    {
      id: 1,
      name: "야구화 아웃도어",
      description: "야외 경기 전용으로 설계된 방수 야구화",
      originalPrice: 135000,
      discountPercent: 14,
      category: "shoes",
      imageUrl: "http://yayongsa.hgodo.com/data/goods/25/03/11/48446/48446_main_074.jpg",
    },
    {
      id: 2,
      name: "프리미엄 야구 배트",
      description: "최신 합금 기술로 제작된 고성능 배트",
      originalPrice: 250000,
      discountPercent: 20,
      category: "bats",
      imageUrl: "https://example.com/images/bat23.jpg",
    },
    {
      id: 3,
      name: "프로 야구 장갑",
      description: "가죽 소재의 고급 필더용 장갑",
      originalPrice: 98000,
      discountPercent: 25,
      category: "gloves",
      imageUrl: "https://example.com/images/glove8.jpg",
    },
    {
      id: 4,
      name: "보호대 세트",
      description: "타자용 풀바디 보호 장비",
      originalPrice: 175000,
      discountPercent: 15,
      category: "protection",
      imageUrl: "https://example.com/images/protect12.jpg",
    },
  ];

  const calculateDiscountedPrice = (price: number, discount: number) => {
    return Math.round(price * (1 - discount / 100));
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(130vh - 64px)",
        textAlign: "center",
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Slider {...sliderSettings}>
            {sliderImages.map((image, index) => (
              <div key={index} style={{ width: "100%", height: "600px" }}>
                <img
                  src={image}
                  alt={`슬라이드 ${index + 1}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "10px",
                  }}
                />
              </div>
            ))}
          </Slider>
        </Box>

        <Typography variant="h3" gutterBottom>
          ⚾ 야구 용품 전문 쇼핑몰
        </Typography>
        <Typography variant="h6" color="textSecondary" paragraph>
          최고의 야구 용품을 만나보세요! 배트, 장갑, 보호장비 등 다양한 상품을 제공합니다.
        </Typography>

        {loading && <Typography>로딩 중...</Typography>}
        {error && <Typography color="error">{error}</Typography>}

        <Box sx={{ mt: 4, mb: 6 }}>
          <Typography variant="h4" color="primary" gutterBottom>
            파격 할인중
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 3,
              justifyContent: "center",
            }}
          >
            {discountedProducts.map((product) => (
              <Card
              key={product.id}
              sx={{
                width: { xs: "100%", sm: "250px" }, // ✅ 박스 너비 줄임
                height: "410px", // ✅ 박스 높이 고정
                transition: "all 0.3s",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  transform: "translateY(-4px)",
                },
              }}
            >
              <CardMedia
                component="img"
                height="250" // ✅ 이미지 높이 줄임
                image={product.imageUrl}
                alt={product.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://via.placeholder.com/300x200";
                }}
              />
              <CardContent sx={{ padding: "12px" }}> {/* ✅ 내부 여백 줄임 */}
                <Typography variant="h6" component="div" align="center">
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, textAlign: "center" }}>
                  {product.description}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 1,
                    mb: 1,
                  }}
                >
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ textDecoration: "line-through" }}
                  >
                    {product.originalPrice.toLocaleString()}원
                  </Typography>
                  <Typography variant="body1" color="error">
                    {product.discountPercent}% OFF
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="h6" color="primary">
                    {calculateDiscountedPrice(product.originalPrice, product.discountPercent).toLocaleString()}원
                  </Typography>
                </Box>
              </CardContent>
            </Card>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}