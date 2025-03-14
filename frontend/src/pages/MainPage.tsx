import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import { useNavigate } from "react-router-dom";

interface DiscountedProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  stock: number;
  category: string;
  image: string;
  isDiscounted: boolean;
}

export default function MainPage() {
  const [products, setProducts] = useState<DiscountedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<number[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null); // 사용자 이메일 상태 추가
  const [filterCategory, setFilterCategory] = useState<string>("전체");
  const navigate = useNavigate();

  const categoryMapping: { [key: string]: string } = {
    전체: "all",
    야구배트: "bats",
    배팅장갑: "batting-gloves",
    보호장비: "protection",
    글러브: "gloves",
    야구화: "shoes",
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get("http://localhost:8092/api/auth/check-auth", {
          withCredentials: true,
        });
        console.log("인증 상태 확인 응답:", response.data); // 디버깅 로그
        if (response.data.isAuthenticated) {
          setIsLoggedIn(true);
          setUserEmail(response.data.email); // 사용자 이메일 저장
        } else {
          setIsLoggedIn(false);
          setUserEmail(null);
        }
      } catch (err) {
        console.error("인증 상태 확인 실패:", err.response?.data || err.message);
        setIsLoggedIn(false);
        setUserEmail(null);
      }
    };

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:8092/api/products/discounted-products", {
          withCredentials: true,
        });
        console.log("상품 데이터:", res.data);
        if (Array.isArray(res.data)) {
          const formattedProducts = res.data.map((item: any) => ({
            ...item,
            image: item.image || "https://placehold.co/300x200",
            category: item.category || "unknown",
          }));
          setProducts(formattedProducts);
          setError(null);
        } else {
          setError("유효한 상품 데이터가 아닙니다.");
          setProducts([]);
        }
      } catch (err) {
        console.error("상품 목록 불러오기 오류:", err.response?.data || err.message);
        setError("상품을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    const initialize = async () => {
      // URL에서 토큰 제거
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has("token")) {
        console.warn("URL에 토큰이 포함되어 있습니다. 제거합니다:", urlParams.get("token"));
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      // 인증 상태 확인 후 상품 데이터 가져오기
      await checkAuthStatus();
      await fetchProducts();
    };

    initialize();
  }, []);

  const toggleCart = async (productId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoggedIn === null) {
      alert("인증 상태를 확인 중입니다. 잠시만 기다려 주세요.");
      return;
    }
    if (!isLoggedIn) {
      if (window.confirm("로그인 후 이용 가능합니다. 로그인 하시겠습니까?")) {
        navigate("/login");
      }
      return;
    }
    try {
      if (cart.includes(productId)) {
        setCart(cart.filter((id) => id !== productId));
      } else {
        await axios.post(
          "http://localhost:8092/api/cart/add",
          { productId },
          { withCredentials: true }
        );
        setCart([...cart, productId]);
        alert(`${productId}번 상품이 장바구니에 추가되었습니다!`);
      }
    } catch (err) {
      console.error("장바구니 처리 실패:", err.response?.data || err.message);
      alert("장바구니 처리에 실패했습니다.");
    }
  };

  const handlePurchase = (productId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoggedIn === null) {
      alert("인증 상태를 확인 중입니다. 잠시만 기다려 주세요.");
      return;
    }
    if (!isLoggedIn) {
      if (window.confirm("로그인 후 이용 가능합니다. 로그인 하시겠습니까?")) {
        navigate("/login");
      }
      return;
    }
    navigate(`/purchase/${productId}`);
  };

  const calculateDiscountedPrice = (price: number, discount: number) => {
    return Math.round(price * (1 - discount / 100));
  };

  const filteredProducts =
    filterCategory === "전체"
      ? products
      : products.filter((product) => product.category === categoryMapping[filterCategory]);

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
        {/* 로그인 상태 표시 (디버깅 및 사용자 경험 개선) */}
        {isLoggedIn === null ? (
          <Typography>로그인 상태 확인 중...</Typography>
        ) : isLoggedIn ? (
          <Typography variant="h6" color="primary">
            {userEmail}님, 환영합니다!
          </Typography>
        ) : (
          <Typography variant="h6" color="textSecondary">
            로그인하지 않았습니다. 로그인을 해주세요.
          </Typography>
        )}

        <Box sx={{ mt: 15, mb: 4 }}>
          <Slider {...sliderSettings}>
            {sliderImages.map((image, index) => (
              <div key={index} style={{ width: "100%" }}>
                <img
                  src={image}
                  alt={`슬라이드 ${index + 1}`}
                  style={{
                    width: "100%",
                    height: "auto",
                    objectFit: "contain",
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

          <Box sx={{ mb: 3, display: "flex", gap: 1, justifyContent: "center" }}>
            {["전체", "야구배트", "배팅장갑", "보호장비", "글러브", "야구화"].map((category) => (
              <Button
                key={category}
                variant={filterCategory === category ? "contained" : "outlined"}
                color="primary"
                onClick={() => setFilterCategory(category)}
                sx={{ textTransform: "none" }}
              >
                {category}
              </Button>
            ))}
          </Box>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 3,
              justifyContent: "flex-start",
            }}
          >
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
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
                    cursor: "pointer",
                  }}
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={product.image}
                    alt={product.name}
                    sx={{ objectFit: "contain" }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/300x200";
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
                          fontSize: "14px",
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
                          onClick={(e) => handlePurchase(product.id, e)}
                        >
                          구매하기
                        </Button>
                        <Box
                          onClick={(e) => toggleCart(product.id, e)}
                          sx={{
                            cursor: "pointer",
                            padding: 0,
                            "&:focus": { outline: "none" },
                            "&:hover": { backgroundColor: "transparent" },
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
              ))
            ) : (
              <Typography>해당 카테고리에 할인 상품이 없습니다.</Typography>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}