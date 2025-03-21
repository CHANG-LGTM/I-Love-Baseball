import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Divider,
  Fade,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface RecommendedProduct {
  id: number;
  name: string;
  price: number;
  image: string;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<RecommendedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Axios 요청에 JWT 토큰 추가
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    };
  };

  // 장바구니 데이터 가져오기
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        setLoading(true);
        const email = localStorage.getItem("email"); // nickname -> email
        if (!email) {
          setError("로그인 후 장바구니를 확인할 수 있습니다.");
          navigate("/login");
          return;
        }

        const res = await axios.get("http://localhost:8092/api/cart", getAuthHeaders());
        console.log("장바구니 데이터:", res.data);
        if (Array.isArray(res.data)) {
          const formattedItems = res.data.map((item: any) => ({
            id: item.id,
            productId: item.productId,
            name: item.name || "상품명 없음",
            price: item.price || 0,
            image: item.image || "https://placehold.co/300x200",
            quantity: item.quantity || 1,
          }));
          setCartItems(formattedItems);
          setError(null);
        } else {
          setError("유효한 장바구니 데이터가 아닙니다.");
          setCartItems([]);
        }

        // 추천 상품 데이터 가져오기 (가정: /api/products/recommended)
        const recommendedRes = await axios.get(
          "http://localhost:8092/api/products/recommended",
          getAuthHeaders()
        );
        if (Array.isArray(recommendedRes.data)) {
          setRecommendedProducts(recommendedRes.data);
        } else {
          // 추천 상품 API가 없거나 실패한 경우 기본 데이터 사용
          setRecommendedProducts([
            { id: 1, name: "야구 배트", price: 50000, image: "https://placehold.co/300x200" },
            { id: 2, name: "배팅 장갑", price: 30000, image: "https://placehold.co/300x200" },
            { id: 3, name: "보호 장비", price: 45000, image: "https://placehold.co/300x200" },
          ]);
        }
      } catch (err) {
        console.error("장바구니 불러오기 오류:", err.response?.data || err.message);
        if (err.response?.status === 401) {
          setError("로그인이 필요합니다.");
          navigate("/login");
        } else {
          setError("장바구니를 불러오는데 실패했습니다.");
        }
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCartItems();
  }, [navigate]);

  // 항목 삭제
  const removeItem = async (cartItemId: number) => {
    try {
      await axios.delete(`http://localhost:8092/api/cart/remove/${cartItemId}`, getAuthHeaders());
      setCartItems(cartItems.filter((item) => item.id !== cartItemId));
    } catch (err) {
      console.error("장바구니 항목 삭제 실패:", err.response?.data || err.message);
      if (err.response?.status === 401) {
        setError("로그인이 필요합니다.");
        navigate("/login");
      } else {
        alert("항목 삭제에 실패했습니다.");
      }
    }
  };

  // 수량 변경
  const updateQuantity = async (cartItemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await axios.put(
        `http://localhost:8092/api/cart/update/${cartItemId}`,
        { quantity: newQuantity },
        getAuthHeaders()
      );
      setCartItems(
        cartItems.map((item) =>
          item.id === cartItemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (err) {
      console.error("수량 업데이트 실패:", err.response?.data || err.message);
      if (err.response?.status === 401) {
        setError("로그인이 필요합니다.");
        navigate("/login");
      } else {
        alert("수량 변경에 실패했습니다.");
      }
    }
  };

  // 총액 계산
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // 결제 페이지로 이동
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("장바구니가 비어있습니다.");
      return;
    }
    navigate("/checkout", { state: { cartItems } });
  };

  // 추천 상품 슬라이더 설정
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 960,
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 600,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  if (loading) {
    return (
      <Typography align="center" sx={{ mt: 8 }}>
        장바구니 로딩 중...
      </Typography>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, mt: 8 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: "bold", textAlign: "center", color: "#1976d2" }}
      >
        🛒 내 장바구니
      </Typography>

      {error && (
        <Typography color="error" align="center" sx={{ mb: 4 }}>
          {error}
        </Typography>
      )}

      {cartItems.length === 0 && !error ? (
        <Fade in={true} timeout={1000}>
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <ShoppingCartIcon sx={{ fontSize: 80, color: "grey.400" }} />
            <Typography variant="h6" sx={{ mt: 2, color: "grey.600" }}>
              장바구니가 비어 있습니다.
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, color: "grey.600" }}>
              마음에 드는 상품을 추가해보세요!
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/")}
              sx={{ mt: 3, px: 4, py: 1.5, borderRadius: "20px" }}
            >
              쇼핑 계속하기
            </Button>
          </Box>
        </Fade>
      ) : (
        <>
          {/* 장바구니 항목 리스트 */}
          {cartItems.map((item) => (
            <Fade in={true} timeout={500} key={item.id}>
              <Card
                sx={{
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  p: 2,
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  transition: "transform 0.3s",
                  "&:hover": { transform: "translateY(-4px)" },
                }}
              >
                <CardMedia
                  component="img"
                  sx={{ width: 120, borderRadius: "8px" }}
                  image={item.image}
                  alt={item.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://via.placeholder.com/300x200";
                  }}
                />
                <CardContent sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {item.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    단가: {item.price.toLocaleString()}원
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                    <IconButton
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <RemoveIcon />
                    </IconButton>
                    <Typography sx={{ mx: 2, fontSize: "1.1rem" }}>
                      {item.quantity}
                    </Typography>
                    <IconButton onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      <AddIcon />
                    </IconButton>
                  </Box>
                </CardContent>
                <Typography variant="body1" sx={{ mr: 2, fontWeight: "bold" }}>
                  {(item.price * item.quantity).toLocaleString()}원
                </Typography>
                <IconButton onClick={() => removeItem(item.id)} sx={{ color: "red" }}>
                  <DeleteIcon />
                </IconButton>
              </Card>
            </Fade>
          ))}

          {/* 총액 및 결제 버튼 */}
          <Divider sx={{ my: 3 }} />
          <Box sx={{ textAlign: "right" }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              총액: <span style={{ color: "#ff5722" }}>{totalPrice.toLocaleString()}원</span>
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleCheckout}
              sx={{
                background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
                color: "white",
                px: 4,
                py: 1.5,
                borderRadius: "20px",
                "&:hover": { background: "linear-gradient(45deg, #FF8E53 30%, #FE6B8B 90%)" },
              }}
            >
              결제하기
            </Button>
          </Box>
        </>
      )}

      {/* 추천 상품 섹션 */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold", color: "#1976d2" }}>
          함께 구매하면 좋은 상품
        </Typography>
        <Slider {...sliderSettings}>
          {recommendedProducts.map((product) => (
            <Box key={product.id} sx={{ px: 1 }}>
              <Card
                sx={{
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  transition: "transform 0.3s",
                  "&:hover": { transform: "translateY(-4px)" },
                }}
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <CardMedia
                  component="img"
                  height="150"
                  image={product.image}
                  alt={product.name}
                  sx={{ objectFit: "contain" }}
                />
                <CardContent>
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {product.price.toLocaleString()}원
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Slider>
      </Box>
    </Container>
  );
}