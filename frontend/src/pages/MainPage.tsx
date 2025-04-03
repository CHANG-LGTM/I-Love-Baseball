import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Container,
  Typography,
} from "@mui/material";
import axios, { AxiosError } from "axios";
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

interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface ApiErrorResponse {
  message?: string;
  error?: string;
  // 필요한 다른 필드 추가
}

// 환경 변수 사용
const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL || "http://localhost:8092";
const IMAGE_BASE_URL = import.meta.env.VITE_APP_IMAGE_BASE_URL || "http://localhost:8092/uploads/";
const FALLBACK_IMAGE = "/images/fallback-product.jpg";

export default function MainPage() {
  const [products, setProducts] = useState<DiscountedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<number[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>("전체");
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const getImageSrc = (image: string | undefined): string => {
    if (!image) return FALLBACK_IMAGE;
    if (image.startsWith("http") || image.startsWith("data:image")) {
      return image;
    }
    return `${IMAGE_BASE_URL}${encodeURIComponent(image)}`;
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await axios.get<DiscountedProduct[]>(`${API_BASE_URL}/api/products/discounted-products`, {
          withCredentials: true,
        });
        
        if (Array.isArray(res.data)) {
          const formattedProducts = res.data.map((item) => ({
            ...item,
            image: getImageSrc(item.image),
            category: item.category || "unknown",
          }));
          setProducts(formattedProducts);
          setError(null);
        } else {
          setError("유효한 상품 데이터가 아닙니다.");
          setProducts([]);
        }
      } catch (err) {
        const axiosError = err as AxiosError<ApiErrorResponse>;
        setError(axiosError.response?.data?.message || "상품을 불러오는데 실패했습니다. 나중에 다시 시도해주세요.");
        setProducts([]);
      } finally {
        setLoading(false);
        setPageLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categoryMapping: { [key: string]: string } = {
    전체: "all",
    야구배트: "bats",
    배팅장갑: "batting-gloves",
    보호장비: "protection",
    글러브: "gloves",
    야구화: "shoes",
  };

  const toggleCart = async (productId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const nickname = localStorage.getItem("nickname");
    const isLoggedIn = !!nickname;
    
    if (pageLoading || !isLoggedIn) {
      if (!isLoggedIn && window.confirm("로그인 후 이용 가능합니다. 로그인 하시겠습니까?")) {
        navigate("/login");
      }
      return;
    }
    
    try {
      if (cart.includes(productId)) {
        setCart(cart.filter((id) => id !== productId));
      } else {
        await axios.post(
          `${API_BASE_URL}/api/cart/add`,
          { productId },
          { withCredentials: true }
        );
        setCart([...cart, productId]);
      }
    } catch (err) {
      console.error(err)
      alert("장바구니 처리에 실패했습니다.");
    }
  };

  const handlePurchase = (product: DiscountedProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    const nickname = localStorage.getItem("nickname");
    const isLoggedIn = !!nickname;
    
    if (!isLoggedIn) {
      if (window.confirm("로그인 후 이용 가능합니다. 로그인 하시겠습니까?")) {
        navigate("/login");
      }
      return;
    }

    const cartItem: CartItem = {
      id: product.id,
      productId: product.id,
      name: product.name,
      price: calculateDiscountedPrice(product.originalPrice, product.discountPercent),
      image: product.image,
      quantity: 1,
    };

    navigate("/checkout", { state: { cartItems: [cartItem] } });
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

  if (pageLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography variant="h6">페이지 로딩 중...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "calc(110vh - 64px)",
        mt: 8,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ mt: 15, mb: 4 }}>
          <Slider {...sliderSettings}>
            {sliderImages.map((image, index) => (
              <div key={index}>
                <img
                  src={image}
                  alt={`슬라이드 ${index + 1}`}
                  style={{
                    width: "100%",
                    height: "auto",
                    maxHeight: "400px",
                    objectFit: "contain",
                    borderRadius: "10px",
                  }}
                />
              </div>
            ))}
          </Slider>
        </Box>

        <Typography variant="h3" gutterBottom textAlign="center">
          ⚾ 야구 용품 전문 쇼핑몰
        </Typography>
        <Typography variant="h6" color="textSecondary" paragraph textAlign="center">
          최고의 야구 용품을 만나보세요!
        </Typography>

        {error && (
          <Box my={2}>
            <Typography color="error" align="center">
              {error}
            </Typography>
          </Box>
        )}

        <Box sx={{ mt: 4, mb: 6 }}>
          <Typography variant="h4" color="primary" gutterBottom textAlign="center">
            파격 할인중
          </Typography>

          <Box sx={{ mb: 3, display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center" }}>
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

          {loading ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(3, 1fr)",
                  lg: "repeat(4, 1fr)",
                },
                gap: 3,
              }}
            >
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      transition: "all 0.3s",
                      "&:hover": {
                        boxShadow: 3,
                        transform: "translateY(-4px)",
                      },
                    }}
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={product.image}
                      alt={product.name}
                      sx={{ objectFit: "contain", p: 1 }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                      }}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography
                        variant="h6"
                        component="div"
                        sx={{
                          mb: 1,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {product.name}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Typography color="error">
                          {product.discountPercent}% 할인
                        </Typography>
                        <Typography
                          color="text.secondary"
                          sx={{ textDecoration: "line-through" }}
                        >
                          {product.originalPrice.toLocaleString()}원
                        </Typography>
                      </Box>
                      <Typography variant="h6" color="primary" mb={2}>
                        {calculateDiscountedPrice(
                          product.originalPrice,
                          product.discountPercent
                        ).toLocaleString()}
                        원
                      </Typography>
                      <Box display="flex" justifyContent="space-between">
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={(e) => handlePurchase(product, e)}
                          sx={{ flex: 1, mr: 1 }}
                        >
                          구매
                        </Button>
                        <Button
                          onClick={(e) => toggleCart(product.id, e)}
                          sx={{ minWidth: "auto", p: 1 }}
                        >
                          {cart.includes(product.id) ? (
                            <FavoriteIcon color="error" />
                          ) : (
                            <FavoriteBorderIcon />
                          )}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Typography gridColumn="1 / -1" textAlign="center" py={4}>
                  해당 카테고리에 할인 상품이 없습니다.
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
}