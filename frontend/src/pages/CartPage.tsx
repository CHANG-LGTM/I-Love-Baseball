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

const PriceDisplay: React.FC<{
  price: number;
  originalPrice?: number;
  discountRate?: number;
}> = ({ price, originalPrice, discountRate }) => (
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

  const getRandomItems = (items: RecommendedProduct[], maxCount: number): RecommendedProduct[] => {
    const shuffled = [...items].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(maxCount, items.length));
  };

  const fetchCartItems = useCallback(async () => {
    const nickname = localStorage.getItem("nickname");
    console.log("Fetching cart items with email:", nickname);

    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8092/api/cart", {
        withCredentials: true,
      });
      console.log("Cart API response:", res.status, res.data);
      if (Array.isArray(res.data)) {
        const formattedItems: CartItem[] = res.data.map((item: any) => ({
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

      const recommendedRes = await axios.get(
        "http://localhost:8092/api/products/discounted-products",
        {
          withCredentials: true,
        }
      );
      console.log("Recommended products response:", recommendedRes.status, recommendedRes.data);
      if (Array.isArray(recommendedRes.data)) {
        const randomRecommended: RecommendedProduct[] = getRandomItems(recommendedRes.data, 9).map((item: any) => ({
          id: item.id,
          name: item.name || "상품명 없음",
          price: item.price || 0,
          originalPrice: item.originalPrice || item.price,
          discountRate: item.discountRate || (item.originalPrice && item.price ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100) : 0),
          image: item.image || "https://placehold.co/300x200",
        }));
        setRecommendedProducts(randomRecommended);
      } else {
        const defaultProducts: RecommendedProduct[] = [
          { id: 1, name: "야구 배트 1", price: 40000, originalPrice: 50000, image: "https://placehold.co/300x200" },
          { id: 2, name: "배팅 장갑 1", price: 24000, originalPrice: 30000, image: "https://placehold.co/300x200" },
          { id: 3, name: "보호 장비 1", price: 36000, originalPrice: 45000, image: "https://placehold.co/300x200" },
          { id: 4, name: "야구 배트 2", price: 44000, originalPrice: 55000, image: "https://placehold.co/300x200" },
          { id: 5, name: "배팅 장갑 2", price: 25600, originalPrice: 32000, image: "https://placehold.co/300x200" },
          { id: 6, name: "보호 장비 2", price: 37600, originalPrice: 47000, image: "https://placehold.co/300x200" },
          { id: 7, name: "야구 배트 3", price: 48000, originalPrice: 60000, image: "https://placehold.co/300x200" },
          { id: 8, name: "배팅 장갑 3", price: 28000, originalPrice: 35000, image: "https://placehold.co/300x200" },
          { id: 9, name: "보호 장비 3", price: 39200, originalPrice: 49000, image: "https://placehold.co/300x200" },
        ];
        setRecommendedProducts(
          getRandomItems(defaultProducts, 9).map((item) => ({
            ...item,
            discountRate: item.discountRate || Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100),
          }))
        );
      }
    } catch (err: any) {
      console.error("Cart fetch error:", err.response?.status, err.response?.data || err.message);
      if (err.response?.status === 401) {
        setError("로그인이 필요합니다.");
        localStorage.removeItem("email");
        localStorage.removeItem("nickname");
        navigate("/login", { replace: true });
      } else {
        setError("장바구니를 불러오는데 실패했습니다.");
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
      await axios.delete(`http://localhost:8092/api/cart/remove/${cartItemId}`, {
        withCredentials: true,
      });
      setCartItems(cartItems.filter((item) => item.id !== cartItemId));
    } catch (err: any) {
      console.error("Cart item removal error:", err.response?.status, err.response?.data || err.message);
      if (err.response?.status === 401) {
        setError("로그인이 필요합니다.");
        localStorage.removeItem("email");
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
        `http://localhost:8092/api/cart/update/${cartItemId}`,
        { quantity: newQuantity },
        {
          withCredentials: true,
        }
      );
      setCartItems(
        cartItems.map((item) =>
          item.id === cartItemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (err: any) {
      console.error("Quantity update error:", err.response?.status, err.response?.data || err.message);
      if (err.response?.status === 401) {
        setError("로그인이 필요합니다.");
        localStorage.removeItem("email");
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

      {error ? (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Typography color="error" align="center" sx={{ mb: 4 }}>
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
                        flex: "1 1 0",
                        borderRadius: "12px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        transition: "transform 0.3s",
                        "&:hover": { transform: "translateY(-4px)" },
                        cursor: "pointer",
                        position: "relative",
                        minWidth: 0,
                        overflow: "visible",
                      }}
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      {product.discountRate && product.discountRate > 0 && (
                        <Badge
                          badgeContent={`${product.discountRate}% OFF`}
                          sx={{
                            position: "absolute",
                            top: 20,
                            right: 25,
                            zIndex: 1,
                            "& .MuiBadge-badge": {
                              backgroundColor: "#ff5722",
                              color: "white",
                              fontSize: "0.65rem",
                              padding: "2px 6px",
                              borderRadius: "10px",
                              minWidth: "30px",
                              height: "20px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            },
                          }}
                        />
                      )}
                      <CardMedia
                        component="img"
                        height="150"
                        image={product.image}
                        alt={product.name}
                        sx={{ objectFit: "contain", borderBottom: "1px solid #eee" }}
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
                          discountRate={product.discountRate}
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