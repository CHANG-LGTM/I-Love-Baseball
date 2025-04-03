import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  CardMedia,
  Tabs,
  Tab,
  TextField,
  Divider,
  IconButton,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import axios, { AxiosError } from "axios";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image: string;
  discounted: boolean;
  originalPrice?: number | null;
  discountPercent?: number | null;
}

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL || "http://localhost:8092";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [cart, setCart] = useState<number[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        await axios.get(`${API_BASE_URL}/api/auth/check-auth`, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        });
        setIsLoggedIn(true);
      } catch (err) {
        console.log(err)
        setIsLoggedIn(false);
      }
    };

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axios.get<Product>(`${API_BASE_URL}/api/products/${id}`);
        const fetchedProduct: Product = {
          ...res.data,
          image: res.data.image || "https://placehold.co/300x200",
        };
        setProduct(fetchedProduct);
        const initialPrice = fetchedProduct.discounted
          ? calculateDiscountedPrice(fetchedProduct.originalPrice, fetchedProduct.discountPercent)
          : fetchedProduct.price;
        setTotalPrice(initialPrice * quantity);
        setError(null);
      } catch (err) {
        const axiosError = err as AxiosError<ApiErrorResponse>;
        setError(
          axiosError.response?.data?.message || 
          axiosError.response?.data?.error || 
          "상품 정보를 불러오는데 실패했습니다."
        );
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
    fetchProduct();
  }, [id, quantity]);

  const toggleCart = () => {
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
    if (product) {
      if (cart.includes(product.id)) {
        setCart(cart.filter((cartId) => cartId !== product.id));
        alert(`${product.name} 상품이 장바구니에서 제거되었습니다.`);
      } else {
        setCart([...cart, product.id]);
        alert(`${product.name} 상품이 장바구니에 추가되었습니다! (수량: ${quantity})`);
      }
    }
  };

  const handlePurchase = () => {
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
    if (product) {
      navigate("/purchase", {
        state: {
          cartItems: [
            {
              id: product.id,
              productId: product.id,
              name: product.name,
              price: product.discounted
                ? calculateDiscountedPrice(product.originalPrice, product.discountPercent)
                : product.price,
              image: product.image,
              quantity,
            },
          ],
        },
      });
    }
  };

  const calculateDiscountedPrice = (
    originalPrice?: number | null, 
    discountPercent?: number | null
  ): number => {
    if (!originalPrice || !discountPercent) return originalPrice || 0;
    return Math.round(originalPrice * (1 - discountPercent / 100));
  };

  const handleQuantityChange = (change: number) => {
    setQuantity((prev) => {
      const newQuantity = prev + change;
      if (newQuantity < 1) return 1;
      if (product && newQuantity > product.stock) return product.stock;
      if (product) {
        const unitPrice = product.discounted
          ? calculateDiscountedPrice(product.originalPrice, product.discountPercent)
          : product.price;
        setTotalPrice(unitPrice * newQuantity);
      }
      return newQuantity;
    });
  };

  const handleQuantityInputChange = (value: string) => {
    const newQuantity = parseInt(value, 10);
    if (!isNaN(newQuantity) && newQuantity >= 1 && product && newQuantity <= product.stock) {
      setQuantity(newQuantity);
      if (product) {
        const unitPrice = product.discounted
          ? calculateDiscountedPrice(product.originalPrice, product.discountPercent)
          : product.price;
        setTotalPrice(unitPrice * newQuantity);
      }
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  if (loading) return <Typography>로딩 중...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!product) return <Typography>상품을 찾을 수 없습니다.</Typography>;

  const discounted = product.discounted || false;
  const displayPrice = discounted
    ? calculateDiscountedPrice(product.originalPrice, product.discountPercent)
    : product.price;

  return (
    <Container maxWidth="lg" sx={{ mt: 15, mb: 6 }}>
      <Grid container spacing={4}>
        {/* 상품 이미지 */}
        <Grid item xs={12} md={6}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <CardMedia
              component="img"
              image={product.image}
              alt={product.name}
              sx={{
                width: "100%",
                maxWidth: 600,
                height: "auto",
                objectFit: "contain",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                mb: 2,
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://via.placeholder.com/600x600";
              }}
            />
          </Box>
        </Grid>

        {/* 상품 정보 */}
        <Grid item xs={12} md={6}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            {product.name}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 3 }}>
            {product.description}
          </Typography>
          {discounted && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ textDecoration: "line-through" }}
              >
                {product.originalPrice?.toLocaleString()}원
              </Typography>
              <Typography variant="h6" color="error">
                {product.discountPercent}% OFF
              </Typography>
            </Box>
          )}
          <Typography variant="h4" color="primary" sx={{ mb: 1 }}>
            {displayPrice.toLocaleString()}원
          </Typography>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
            총 금액: {totalPrice.toLocaleString()}원
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            재고: {product.stock}개
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            카테고리:{" "}
            {product.category === "bats"
              ? "야구배트"
              : product.category === "batting-gloves"
              ? "배팅장갑"
              : product.category === "protection"
              ? "보호장비"
              : product.category === "shoes"
              ? "야구화"
              : "글러브"}
          </Typography>

          {/* 수량 선택 */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <Typography variant="body1">수량:</Typography>
            <Box sx={{ display: "flex", alignItems: "center", border: "1px solid #ccc", borderRadius: "4px" }}>
              <IconButton onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                <RemoveIcon />
              </IconButton>
              <TextField
                value={quantity}
                onChange={(e) => handleQuantityInputChange(e.target.value)}
                inputProps={{ style: { textAlign: "center", width: "40px" } }}
                variant="standard"
                sx={{ mx: 1 }}
              />
              <IconButton onClick={() => handleQuantityChange(1)} disabled={quantity >= product.stock}>
                <AddIcon />
              </IconButton>
            </Box>
          </Box>

          {/* 버튼 */}
          <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handlePurchase}
              sx={{
                flex: 1,
                py: 1.5,
                fontSize: "16px",
                fontWeight: "bold",
                borderRadius: "8px",
              }}
            >
              바로 구매
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              onClick={toggleCart}
              sx={{
                flex: 1,
                py: 1.5,
                fontSize: "16px",
                fontWeight: "bold",
                borderRadius: "8px",
              }}
              startIcon={
                cart.includes(product.id) ? (
                  <FavoriteIcon sx={{ color: "red" }} />
                ) : (
                  <FavoriteBorderIcon />
                )
              }
            >
              {cart.includes(product.id) ? "장바구니 제거" : "장바구니 담기"}
            </Button>
          </Box>

          {/* 추가 정보 탭 */}
          <Divider sx={{ mb: 3 }} />
          <Tabs value={selectedTab} onChange={handleTabChange} centered sx={{ mb: 2 }}>
            <Tab label="상품 설명" />
            <Tab label="배송 정보" />
            <Tab label="리뷰" />
          </Tabs>
          {selectedTab === 0 && (
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                상품 특징
              </Typography>
              <Typography variant="body2" color="text.secondary">
                - 고품질 소재 사용<br />
                - 내구성 뛰어남<br />
                - 편안한 착용감<br />
                - 다양한 환경에서 사용 가능
              </Typography>
            </Box>
          )}
          {selectedTab === 1 && (
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                배송 정보
              </Typography>
              <Typography variant="body2" color="text.secondary">
                - 배송비: 3,000원 (50,000원 이상 구매 시 무료)<br />
                - 평균 배송 기간: 2~3일 (영업일 기준)<br />
                - 도서산간 지역 추가 배송비: 3,000원
              </Typography>
            </Box>
          )}
          {selectedTab === 2 && (
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                리뷰
              </Typography>
              <Typography variant="body2" color="text.secondary">
                현재 리뷰가 없습니다. 첫 번째 리뷰를 작성해 보세요!
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}