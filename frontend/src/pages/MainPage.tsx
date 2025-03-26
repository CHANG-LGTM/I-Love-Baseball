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

interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export default function MainPage() {
  const [products, setProducts] = useState<DiscountedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<number[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>("전체");
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // 페이지 로드 시 상품 데이터 가져오기
  useEffect(() => {
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
        setError("상품을 불러오는데 실패했습니다. 서버를 확인해주세요.");
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

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:8092/api/auth/logout", {}, { withCredentials: true });
      localStorage.removeItem("token");
      localStorage.removeItem("nickname");
      alert("로그아웃되었습니다.");
      navigate("/login");
    } catch (err) {
      console.error("로그아웃 실패:", err.response?.data || err.message);
      alert("로그아웃에 실패했습니다.");
    }
  };

  const toggleCart = async (productId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const nickname = localStorage.getItem("nickname");
    const isLoggedIn = !!nickname;
    console.log("toggleCart - isLoggedIn:", isLoggedIn);
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

  const handlePurchase = (product: DiscountedProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    const nickname = localStorage.getItem("nickname");
    const isLoggedIn = !!nickname;
    if (pageLoading || !isLoggedIn) {
      if (!isLoggedIn && window.confirm("로그인 후 이용 가능합니다. 로그인 하시겠습니까?")) {
        navigate("/login");
      }
      return;
    }

    // 선택한 상품을 CartItem 형식으로 변환
    const cartItem: CartItem = {
      id: product.id,
      productId: product.id,
      name: product.name,
      price: calculateDiscountedPrice(product.originalPrice, product.discountPercent),
      image: product.image,
      quantity: 1, // 기본 수량 1로 설정
    };

    // /checkout으로 이동하며 선택한 상품 정보를 state로 전달
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
    return <Typography align="center">페이지 로딩 중...</Typography>;
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(110vh - 64px)",
        textAlign: "center",
        mt: 8,
      }}
    >
      <Container maxWidth="lg">
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
                          onClick={(e) => handlePurchase(product, e)}
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