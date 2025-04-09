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
  Grid,
  useMediaQuery,
  useTheme,
  Stack,
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
  variant?: "body2" | "body1" | "h6";
  isStacked?: boolean;
}> = ({ price, originalPrice, variant = "body2", isStacked = false }) => (
  <Box 
    sx={{ 
      display: "flex", 
      flexDirection: isStacked ? "column" : "row",
      justifyContent: isStacked ? "center" : "flex-start", 
      gap: isStacked ? 0.5 : 1, 
      alignItems: isStacked ? "center" : "center" 
    }}
  >
    {originalPrice && originalPrice > price && (
      <Typography
        variant={variant}
        sx={{
          textDecoration: "line-through",
          color: "grey.500",
          fontSize: variant === "body2" ? "0.8rem" : variant === "body1" ? "0.9rem" : "1rem",
        }}
      >
        {originalPrice.toLocaleString()}원
      </Typography>
    )}
    <Typography
      variant={variant}
      sx={{
        color: "#ff5722",
        fontWeight: "bold",
        fontSize: variant === "body2" ? "0.9rem" : variant === "body1" ? "1rem" : "1.1rem",
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
  const theme = useTheme();
  
  // 더 세분화된 반응형 브레이크포인트
  const isXSmall = useMediaQuery(theme.breakpoints.down('sm')); // 0-600px (모바일)
  const isSmall = useMediaQuery(theme.breakpoints.between('sm', 'md')); // 600-900px (작은 태블릿)
  const isMedium = useMediaQuery(theme.breakpoints.between('md', 'lg')); // 900-1200px (큰 태블릿/작은 노트북)
  const isLarge = useMediaQuery(theme.breakpoints.between('lg', 'xl')); // 1200-1536px (노트북)
  const isXLarge = useMediaQuery(theme.breakpoints.up('xl')); // 1536px+ (대형 모니터)

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
        12
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

  // 화면 크기에 따라 슬라이더 그룹 수 조정
  const getGroupSize = () => {
    if (isXSmall) return 1; // 모바일: 한 행에 1개
    if (isSmall) return 2;  // 작은 태블릿: 한 행에 2개
    if (isMedium) return 3; // 큰 태블릿/작은 노트북: 한 행에 3개
    if (isLarge) return 4;  // 노트북: 한 행에 4개
    return 5;               // 대형 모니터: 한 행에 5개
  };

  // 추천 상품 그룹화
  const groupSize = getGroupSize();
  const groupedRecommendedProducts: RecommendedProduct[][] = [];
  for (let i = 0; i < recommendedProducts.length; i += groupSize) {
    groupedRecommendedProducts.push(recommendedProducts.slice(i, i + groupSize));
  }

  const sliderSettings = {
    dots: true,
    infinite: recommendedProducts.length > groupSize,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: !isXSmall && !isSmall, // 모바일과 작은 태블릿에서는 화살표 감추기
    adaptiveHeight: true,
    responsive: [
      {
        breakpoint: theme.breakpoints.values.sm, // 600px
        settings: {
          dots: true,
          arrows: false,
        }
      },
      {
        breakpoint: theme.breakpoints.values.md, // 900px
        settings: {
          dots: true,
          arrows: false,
        }
      },
      {
        breakpoint: theme.breakpoints.values.lg, // 1200px
        settings: {
          dots: true,
          arrows: true,
        }
      }
    ]
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography variant="h6">장바구니 로딩 중...</Typography>
      </Box>
    );
  }

  return (
    <Container 
      maxWidth={isXLarge ? "xl" : "lg"} 
      sx={{ 
        py: { xs: 2, sm: 3, md: 4 }, 
        mt: 8,
        px: { xs: 1, sm: 2, md: 3 }
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        sx={{ 
          fontWeight: "bold", 
          textAlign: "center", 
          color: "#1976d2",
          mb: { xs: 2, sm: 3, md: 4 },
          fontSize: { 
            xs: "1.5rem", 
            sm: "1.75rem", 
            md: "2rem", 
            lg: "2.25rem",
            xl: "2.5rem"
          }
        }}
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
              sx={{ 
                mt: 3, 
                px: 4, 
                py: 1.5, 
                borderRadius: "20px",
                fontSize: { xs: "0.875rem", sm: "0.9rem", md: "1rem" }
              }}
            >
              로그인하기
            </Button>
          )}
        </Box>
      ) : cartItems.length === 0 ? (
        <Fade in={true} timeout={1000}>
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <ShoppingCartIcon 
              sx={{ 
                fontSize: { 
                  xs: 60, 
                  sm: 70, 
                  md: 80, 
                  lg: 90,
                  xl: 100
                }, 
                color: "grey.400" 
              }} 
            />
            <Typography 
              variant="h6" 
              sx={{ 
                mt: 2, 
                color: "grey.600",
                fontSize: { 
                  xs: "1rem", 
                  sm: "1.1rem", 
                  md: "1.2rem", 
                  lg: "1.25rem",
                  xl: "1.3rem"
                } 
              }}
            >
              장바구니가 비어 있습니다.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/")}
              sx={{ 
                mt: 3, 
                px: { 
                  xs: 3, 
                  sm: 3.5, 
                  md: 4, 
                  lg: 5,
                  xl: 6
                }, 
                py: { 
                  xs: 1, 
                  sm: 1.25, 
                  md: 1.5 
                }, 
                borderRadius: "20px",
                fontSize: { 
                  xs: "0.875rem", 
                  sm: "0.9rem", 
                  md: "1rem",
                  lg: "1.1rem"
                }
              }}
            >
              쇼핑 계속하기
            </Button>
          </Box>
        </Fade>
      ) : (
        <>
          {/* 장바구니 상품 목록 */}
          <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
            {cartItems.map((item) => (
              <Fade in={true} timeout={500} key={item.id}>
                <Card
                  sx={{
                    mb: 2,
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: { xs: "center", sm: "stretch" },
                    p: { xs: 1.5, sm: 2 },
                    borderRadius: "12px",
                    boxShadow: 2,
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": { 
                      transform: "translateY(-4px)", 
                      boxShadow: 4
                    },
                    overflow: "hidden"
                  }}
                >
                  {/* 상품 이미지 */}
                  <Box sx={{ 
                    width: { 
                      xs: "100%", 
                      sm: "120px", 
                      md: "140px",
                      lg: "160px",
                      xl: "180px"
                    },
                    height: { 
                      xs: "140px", 
                      sm: "120px", 
                      md: "140px",
                      lg: "160px",
                      xl: "180px"
                    },
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    p: { xs: 1, sm: 1.5 }
                  }}>
                    <CardMedia
                      component="img"
                      sx={{ 
                        width: "100%", 
                        height: "100%", 
                        objectFit: "contain", 
                        borderRadius: "8px"
                      }}
                      image={item.image}
                      alt={item.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                      }}
                    />
                  </Box>
                  
                  {/* 상품 정보 및 컨트롤 */}
                  <CardContent 
                    sx={{ 
                      flex: 1,
                      width: "100%",
                      p: { xs: 1.5, sm: 2 },
                      "&:last-child": { pb: { xs: 1.5, sm: 2 } }
                    }}
                  >
                    <Grid container spacing={2} alignItems="center">
                      {/* 상품명 및 가격 정보 */}
                      <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                        <Stack spacing={1}>
                          <Typography 
                            variant="subtitle1" 
                            sx={{ 
                              fontWeight: "bold",
                              textAlign: { xs: "center", sm: "left" },
                              fontSize: { 
                                xs: "0.95rem", 
                                sm: "1rem", 
                                md: "1.1rem", 
                                lg: "1.15rem",
                                xl: "1.2rem"
                              },
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              lineHeight: 1.3
                            }}
                          >
                            {item.name}
                          </Typography>
                          
                          <Box sx={{ 
                            display: "flex", 
                            justifyContent: { xs: "center", sm: "flex-start" }
                          }}>
                            <PriceDisplay 
                              price={item.price} 
                              variant={
                                isXSmall ? "body2" : 
                                isSmall ? "body1" : 
                                "h6"
                              }
                            />
                          </Box>
                        </Stack>
                      </Grid>
                      
                      {/* 수량 조절 */}
                      <Grid item xs={12} sm={6} md={3} lg={3} xl={3}
                        sx={{ 
                          display: "flex", 
                          justifyContent: { 
                            xs: "center", 
                            sm: "flex-start", 
                            md: "center" 
                          }
                        }}
                      >
                        <Box sx={{ 
                          display: "flex", 
                          alignItems: "center", 
                          border: "1px solid #e0e0e0",
                          borderRadius: "20px",
                          p: 0.5
                        }}>
                          <IconButton
                            size="small"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            sx={{ 
                              p: { xs: 0.5, sm: 0.75, md: 1 },
                              "&.Mui-disabled": {
                                color: "rgba(0, 0, 0, 0.26)"
                              }
                            }}
                          >
                            <RemoveIcon fontSize={
                              isXSmall ? "small" : 
                              isSmall ? "medium" : 
                              "large"
                            } />
                          </IconButton>
                          <Typography sx={{ 
                            mx: { xs: 1, sm: 1.5, md: 2 }, 
                            fontSize: { 
                              xs: "0.9rem", 
                              sm: "1rem", 
                              md: "1.1rem",
                              lg: "1.2rem"
                            },
                            minWidth: { xs: "1.5rem", sm: "2rem" },
                            textAlign: "center",
                            fontWeight: "medium"
                          }}>
                            {item.quantity}
                          </Typography>
                          <IconButton 
                            size="small"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            sx={{ p: { xs: 0.5, sm: 0.75, md: 1 } }}
                          >
                            <AddIcon fontSize={
                              isXSmall ? "small" : 
                              isSmall ? "medium" : 
                              "large"
                            } />
                          </IconButton>
                        </Box>
                      </Grid>
                      
                      {/* 총 금액 */}
                      <Grid item xs={6} sm={4} md={2} lg={2} xl={2}
                        sx={{ 
                          display: "flex", 
                          justifyContent: { xs: "center", sm: "flex-end" },
                          alignItems: "center",
                          order: { xs: 1, sm: 2 }
                        }}
                      >
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            fontWeight: "bold",
                            color: "#ff5722",
                            fontSize: { 
                              xs: "0.9rem", 
                              sm: "1rem", 
                              md: "1.1rem", 
                              lg: "1.15rem",
                              xl: "1.2rem"
                            }
                          }}
                        >
                          {(item.price * item.quantity).toLocaleString()}원
                        </Typography>
                      </Grid>
                      
                      {/* 삭제 버튼 */}
                      <Grid item xs={6} sm={2} md={1} lg={1} xl={1}
                        sx={{ 
                          display: "flex", 
                          justifyContent: { xs: "center", sm: "flex-end" },
                          order: { xs: 2, sm: 3 }
                        }}
                      >
                        <IconButton 
                          onClick={() => removeItem(item.id)} 
                          sx={{ 
                            color: "red",
                            p: { xs: 0.5, sm: 0.75, md: 1 },
                            "&:hover": {
                              backgroundColor: "rgba(244, 67, 54, 0.08)"
                            }
                          }}
                          size={
                            isXSmall ? "small" : 
                            isSmall ? "medium" : 
                            "large"
                          }
                        >
                          <DeleteIcon fontSize={
                            isXSmall ? "small" : 
                            isSmall ? "medium" : 
                            "large"
                          } />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Fade>
            ))}
          </Box>

          {/* 총액 및 결제 버튼 */}
          <Divider sx={{ my: { xs: 2, sm: 3, md: 4 } }} />
          <Box sx={{ 
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: { xs: "center", sm: "space-between", md: "flex-end" },
            alignItems: { xs: "center", sm: "center" },
            gap: { xs: 2, sm: 3 }
          }}>
            <Typography 
              variant="h5" 
              sx={{ 
                fontSize: { 
                  xs: "1.1rem", 
                  sm: "1.3rem", 
                  md: "1.5rem", 
                  lg: "1.65rem",
                  xl: "1.8rem"
                },
                fontWeight: { xs: "medium", sm: "bold" }
              }}
            >
              총액: <span style={{ color: "#ff5722", fontWeight: "bold" }}>{totalPrice.toLocaleString()}원</span>
            </Typography>
            <Button
              variant="contained"
              size={
                isXSmall ? "medium" : 
                isSmall ? "large" : 
                "large"
              }
              onClick={handleCheckout}
              sx={{
                background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
                color: "white",
                px: { 
                  xs: 3, 
                  sm: 4, 
                  md: 5, 
                  lg: 6,
                  xl: 7
                },
                py: { 
                  xs: 1, 
                  sm: 1.25, 
                  md: 1.5 
                },
                borderRadius: "24px",
                boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
                "&:hover": { 
                  background: "linear-gradient(45deg, #FF8E53 30%, #FE6B8B 90%)",
                  transform: "scale(1.02)"
                },
                fontSize: { 
                  xs: "0.9rem", 
                  sm: "1rem", 
                  md: "1.1rem",
                  lg: "1.2rem"
                },
                transition: "all 0.3s"
              }}
            >
              결제하기
            </Button>
          </Box>
        </>
      )}

      {/* 추천 상품 섹션 */}
      {recommendedProducts.length > 0 && (
        <Box sx={{ mt: { xs: 4, sm: 5, md: 6, lg: 7, xl: 8 } }}>
          <Typography 
            variant="h5" 
            sx={{ 
              mb: { 
                xs: 2, 
                sm: 2.5, 
                md: 3, 
                lg: 4,
                xl: 5
              }, 
              fontWeight: "bold", 
              color: "#1976d2",
              textAlign: { xs: "center", sm: "left" },
              fontSize: { 
                xs: "1.1rem", 
                sm: "1.3rem", 
                md: "1.5rem", 
                lg: "1.65rem",
                xl: "1.8rem"
              },
              borderLeft: { xs: "none", sm: "4px solid #1976d2" },
              pl: { xs: 0, sm: 2 }
            }}
          >
            이런 상품도 함께해보세요!
          </Typography>
          
          <Box sx={{ mx: { xs: -1, sm: 0 } }}>
            <Slider {...sliderSettings}>
              {groupedRecommendedProducts.map((group, index) => (
                <Box key={index} sx={{ px: { xs: 1, sm: 1.5, md: 2 } }}>
                  <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
                    {group.map((product) => (
                      <Grid item xs={12} sm={6} md={4} lg={12/groupSize} xl={12/groupSize} key={product.id}>
                        <Card
                          sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: { 
                              xs: "8px", 
                              sm: "10px", 
                              md: "12px" 
                            },
                            boxShadow: { 
                              xs: 1, 
                              sm: 2, 
                              md: 3 
                            },
                            transition: "all 0.3s",
                            "&:hover": { 
                              transform: "translateY(-6px)",
                              boxShadow: 4
                            },
                            cursor: "pointer",
                            overflow: "hidden"
                          }}
                          onClick={() => navigate(`/product/${product.id}`)}
                        >
                          {/* 할인 뱃지 */}
                          {product.discountRate && product.discountRate > 0 && (
                            <Badge
                              badgeContent={`${product.discountRate}% OFF`}
                              color="error"
                              sx={{
                                position: "absolute",
                                top: 10,
                                right: 10,
                                "& .MuiBadge-badge": {
                                  fontSize: { 
                                    xs: "0.6rem", 
                                    sm: "0.65rem", 
                                    md: "0.7rem",
                                    lg: "0.75rem"
                                  },
                                  padding: "0 4px",
                                  minWidth: "10px",
                                  height: { 
                                    xs: "16px", 
                                    sm: "18px", 
                                    md: "20px",
                                    lg: "22px"
                                  },
                                  borderRadius: "10px",
                                  fontWeight: "bold"
                                },
                              }}
                            />
                          )}
                          
                          {/* 상품 이미지 */}
                          <Box sx={{
                            height: { 
                              xs: 120, 
                              sm: 140, 
                              md: 160, 
                              lg: 180,
                              xl: 200
                            },
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            p: { 
                              xs: 1, 
                              sm: 1.5, 
                              md: 2 
                            },
                            backgroundColor: "rgba(245, 245, 245, 0.4)"
                          }}>
                            <CardMedia
                              component="img"
                              sx={{
                                height: "100%",
                                objectFit: "contain",
                                transition: "transform 0.3s",
                                "&:hover": {
                                  transform: "scale(1.05)"
                                }
                              }}
                              image={product.image}
                              alt={product.name}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                              }}
                            />
                          </Box>
                          
                          {/* 상품 정보 */}
                          <CardContent sx={{ 
                            textAlign: "center", 
                            flexGrow: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            p: { 
                              xs: 1.5, 
                              sm: 2 
                            },
                            "&:last-child": { 
                              pb: { 
                                xs: 1.5, 
                                sm: 2 
                              } 
                            }
                          }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: "bold",
                                mb: 1.5,
                                fontSize: { 
                                  xs: "0.8rem", 
                                  sm: "0.85rem", 
                                  md: "0.9rem", 
                                  lg: "0.95rem",
                                  xl: "1rem"
                                },
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                lineHeight: 1.3,
                                height: { 
                                  xs: "2.6em", 
                                  sm: "2.6em" 
                                },
                                color: "text.primary"
                              }}
                            >
                              {product.name}
                            </Typography>
                            <PriceDisplay
                              price={product.price}
                              originalPrice={product.originalPrice}
                              variant={
                                isXSmall ? "body2" : 
                                isSmall ? "body1" : 
                                "h6"
                              }
                              isStacked={isXSmall}
                            />
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ))}
            </Slider>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default CartPage;