import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Button,
  IconButton,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import axios from "axios";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { DiscountedProduct } from "../types";

export default function MainPage() {
  const [products, setProducts] = useState<DiscountedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<number[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:8092/api/products/discounted-products");
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

  const toggleCart = (productId: number) => {
    if (cart.includes(productId)) {
      setCart(cart.filter((id) => id !== productId));
    } else {
      setCart([...cart, productId]);
      alert(`${productId}번 상품이 장바구니에 추가되었습니다!`);
    }
  };

  const handlePurchase = (productId: number) => {
    alert(`${productId}번 상품 구매 페이지로 이동합니다!`);
  };

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
        minHeight: "calc(110vh - 64px)",
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
            {products.map((product) => (
              <Card
                key={product.id}
                sx={{
                  width: { xs: "100%", sm: "250px" },
                  height: "450px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "all 0.3s",
                  "&:hover": {
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    transform: "translateY(-4px)",
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={product.imageUrl}
                  alt={product.name}
                  sx={{ objectFit: "contain" }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://placehold.co/300x200";
                  }}
                />
                <CardContent
                  sx={{
                    padding: "12px",
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography
                      variant="h6"
                      component="div"
                      align="center"
                      sx={{
                        fontSize: "16px",
                        lineHeight: "1.2",
                        minHeight: "40px",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {product.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 1,
                        textAlign: "center",
                        fontSize: "14px", // 설명 글자 크기 유지
                        lineHeight: "1.3",
                        minHeight: "40px",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {product.description}
                    </Typography>
                  </Box>
                  <Box>
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
                        sx={{ textDecoration: "line-through", fontSize: "14px" }}
                      >
                        {product.originalPrice.toLocaleString()}원
                      </Typography>
                      <Typography variant="body1" color="error" sx={{ fontSize: "14px" }}>
                        {product.discountPercent}% OFF
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Typography variant="h6" color="primary" sx={{ fontSize: "16px" }}>
                        {calculateDiscountedPrice(
                          product.originalPrice,
                          product.discountPercent
                        ).toLocaleString()}
                        원
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <Button
                        variant="contained"
                        color="primary"
                        size="medium"
                        sx={{
                          fontSize: "20px",
                          padding: "8px 20px",
                          borderRadius: "8px",
                        }}
                        onClick={() => handlePurchase(product.id)}
                      >
                        구매하기
                      </Button>
                      {/* 하트 버튼 스타일 조정 */}
                      <Box
                        onClick={() => toggleCart(product.id)}
                        sx={{
                          cursor: "pointer",
                          padding: 0,
                          "&:focus": { outline: "none" }, // 포커스 링 제거
                          "&:hover": { backgroundColor: "transparent" }, // 호버 배경 제거
                        }}
                      >
                        {cart.includes(product.id) ? (
                          <FavoriteIcon sx={{ color: "red", fontSize: "34px" }} />
                        ) : (
                          <FavoriteBorderIcon sx={{ color: "grey", fontSize: "34px" }} />
                        )}
                      </Box>
                    </Box>
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