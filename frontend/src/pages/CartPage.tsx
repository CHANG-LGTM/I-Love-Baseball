import React, { useState, useEffect, useCallback } from "react";
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
  Badge,
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
  originalPrice: number;
  discountRate?: number;
  image: string;
}

interface ApiCartItem {
  id: number;
  productId: number;
  name?: string;
  price?: number;
  image?: string;
  quantity?: number;
}

interface ApiProduct {
  id: number;
  name?: string;
  price?: number;
  originalPrice?: number;
  discountRate?: number;
  image?: string;
}

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL || "http://localhost:8092";
const IMAGE_BASE_URL = import.meta.env.VITE_APP_IMAGE_BASE_URL || "http://localhost:8092/uploads/";
const FALLBACK_IMAGE = "/images/fallback-product.jpg";

const PriceDisplay: React.FC<{
  price: number;
  originalPrice?: number;
}> = ({ price, originalPrice }) => (
  <Box sx={{ display: "flex", justifyContent: "center", gap: 1, alignItems: "center" }}>
    {originalPrice && originalPrice > price && (
      <Typography
        variant="body2"
        sx={{
          textDecoration: "line-through",
          color: "grey.500",
          fontSize: "0.9rem",
        }}
      >
        {originalPrice.toLocaleString()}원
      </Typography>
    )}
    <Typography
      variant="body2"
      sx={{
        color: "#ff5722",
        fontWeight: "bold",
        fontSize: "1rem",
      }}
    >
      {price.toLocaleString()}원
    </Typography>
  </Box>
);

const CartPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<RecommendedProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const getImageSrc = (image: string | undefined): string => {
    if (!image) return FALLBACK_IMAGE;
    if (image.startsWith("http") || image.startsWith("data:image")) {
      return image;
    }
    return `${IMAGE_BASE_URL}${encodeURIComponent(image.split("/").pop() || "")}`;
  };

  const getRandomItems = (items: RecommendedProduct[], maxCount: number): RecommendedProduct[] => {
    const shuffled = [...items].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(maxCount, items.length));
  };

  const fetchCartItems = useCallback(async () => {
    try {
      setLoading(true);
      const [cartRes, recommendedRes] = await Promise.all([
        axios.get<ApiCartItem[]>(`${API_BASE_URL}/api/cart`, {
          withCredentials: true,
        }),
        axios.get<ApiProduct[]>(`${API_BASE_URL}/api/products/discounted-products`, {
          withCredentials: true,
        }),
      ]);

      // Cart items 처리
      const formattedItems: CartItem[] = cartRes.data.map((item) => ({
        id: item.id,
        productId: item.productId,
        name: item.name || "상품명 없음",
        price: item.price || 0,
        image: getImageSrc(item.image),
        quantity: item.quantity || 1,
      }));
      setCartItems(formattedItems);
      setError(null);

      // 추천 상품 처리
      const randomRecommended: RecommendedProduct[] = getRandomItems(
        recommendedRes.data.map((item) => ({
          id: item.id,
          name: item.name || "상품명 없음",
          price: item.price || 0,
          originalPrice: item.originalPrice || item.price || 0,
          discountRate: item.discountRate || 
            (item.originalPrice && item.price 
              ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100) 
              : 0),
          image: getImageSrc(item.image),
        })),
        9
      );
      setRecommendedProducts(randomRecommended);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setError("로그인이 필요합니다.");
          localStorage.removeItem("nickname");
          navigate("/login", { replace: true });
        } else {
          setError("장바구니를 불러오는데 실패했습니다.");
        }
      } else {
        setError("알 수 없는 오류가 발생했습니다.");
      }
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  const removeItem = async (cartItemId: number) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/cart/remove/${cartItemId}`, {
        withCredentials: true,
      });
      setCartItems(cartItems.filter((item) => item.id !== cartItemId));
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError("로그인이 필요합니다.");
        localStorage.removeItem("nickname");
        navigate("/login", { replace: true });
      } else {
        alert("항목 삭제에 실패했습니다.");
      }
    }
  };

  const updateQuantity = async (cartItemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      await axios.put(
        `${API_BASE_URL}/api/cart/update/${cartItemId}`,
        { quantity: newQuantity },
        { withCredentials: true }
      );
      setCartItems(
        cartItems.map((item) =>
          item.id === cartItemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError("로그인이 필요합니다.");
        localStorage.removeItem("nickname");
        navigate("/login", { replace: true });
      } else {
        alert("수량 변경에 실패했습니다.");
      }
    }
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("장바구니가 비어있습니다.");
      return;
    }
    navigate("/checkout", { state: { cartItems } });
  };

  const groupedRecommendedProducts: RecommendedProduct[][] = [];
  for (let i = 0; i < recommendedProducts.length; i += 3) {
    groupedRecommendedProducts.push(recommendedProducts.slice(i, i + 3));
  }

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    adaptiveHeight: true,
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography variant="h6">장바구니 로딩 중...</Typography>
      </Box>
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

      {error ? (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Typography color="error" sx={{ mb: 4 }}>
            {error}
          </Typography>
          {error.includes("로그인") && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/login")}
              sx={{ mt: 3, px: 4, py: 1.5, borderRadius: "20px" }}
            >
              로그인하기
            </Button>
          )}
        </Box>
      ) : cartItems.length === 0 ? (
        <Fade in={true} timeout={1000}>
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <ShoppingCartIcon sx={{ fontSize: 80, color: "grey.400" }} />
            <Typography variant="h6" sx={{ mt: 2, color: "grey.600" }}>
              장바구니가 비어 있습니다.
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
          {cartItems.map((item) => (
            <Fade in={true} timeout={500} key={item.id}>
              <Card
                sx={{
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  p: 2,
                  borderRadius: "12px",
                  boxShadow: 3,
                  transition: "transform 0.3s",
                  "&:hover": { transform: "translateY(-4px)" },
                }}
              >
                <CardMedia
                  component="img"
                  sx={{ width: 120, height: 120, objectFit: "contain", borderRadius: "8px" }}
                  image={item.image}
                  alt={item.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                  }}
                />
                <CardContent sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {item.name}
                  </Typography>
                  <PriceDisplay price={item.price} />
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

      {recommendedProducts.length > 0 && (
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold", color: "#1976d2" }}>
            이런 상품도 함께해보세요!
          </Typography>
          <Slider {...sliderSettings}>
            {groupedRecommendedProducts.map((group, index) => (
              <Box key={index} sx={{ px: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                  {group.map((product) => (
                    <Card
                      key={product.id}
                      sx={{
                        flex: 1,
                        borderRadius: "12px",
                        boxShadow: 3,
                        transition: "transform 0.3s",
                        "&:hover": { transform: "translateY(-4px)" },
                        cursor: "pointer",
                      }}
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      {product.discountRate && product.discountRate > 0 && (
                        <Badge
                          badgeContent={`${product.discountRate}% OFF`}
                          color="error"
                          sx={{
                            position: "absolute",
                            top: 16,
                            right: 16,
                            "& .MuiBadge-badge": {
                              fontSize: "0.65rem",
                              padding: "2px 6px",
                              borderRadius: "10px",
                            },
                          }}
                        />
                      )}
                      <CardMedia
                        component="img"
                        height="150"
                        image={product.image}
                        alt={product.name}
                        sx={{ objectFit: "contain", p: 2 }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                        }}
                      />
                      <CardContent sx={{ textAlign: "center" }}>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: "bold",
                            mb: 1,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {product.name}
                        </Typography>
                        <PriceDisplay
                          price={product.price}
                          originalPrice={product.originalPrice}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Box>
            ))}
          </Slider>
        </Box>
      )}
    </Container>
  );
};

export default CartPage;