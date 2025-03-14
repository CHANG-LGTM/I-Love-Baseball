import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Button,
  Grid,
  Pagination,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import axios from "axios";

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

export default function ProductCategory() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const itemsPerPage = 16;

  const [cart, setCart] = useState<number[]>([]);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        await axios.get("http://localhost:8092/api/auth/check-auth", {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        });
        setIsLoggedIn(true);
      } catch (err) {
        console.error("인증 상태 확인 실패:", err);
        setIsLoggedIn(false);
      }
    };

    const fetchProducts = async () => {
      try {
        const res = await axios.get(`http://localhost:8092/api/products/category/${category}`);
        const responseProducts: Product[] = res.data.map((item: any) => ({
          ...item,
          image: item.image || "https://placehold.co/300x200",
        }));

        const allProducts = [...responseProducts]
          .filter((item, index, self) => index === self.findIndex((t) => t.id === item.id))
          .sort(() => 0.5 - Math.random());
        setProducts(allProducts);
      } catch (err) {
        console.error("상품 목록 불러오기 오류:", err);
      }
    };

    checkAuthStatus();
    fetchProducts();
  }, [category]);

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const displayedProducts = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleCart = (productId: number, e: React.MouseEvent) => {
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
    if (cart.includes(productId)) {
      setCart(cart.filter((id) => id !== productId));
    } else {
      setCart([...cart, productId]);
      alert(`${productId}번 상품이 장바구니에 추가되었습니다!`);
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
    alert(`${productId}번 상품 구매 페이지로 이동합니다!`);
  };

  const calculateDiscountedPrice = (originalPrice: number, discountPercent: number) => {
    if (!originalPrice || !discountPercent) return originalPrice || 0;
    return Math.round(originalPrice * (1 - discountPercent / 100));
  };

  return (
    <Container maxWidth="lg" sx={{ textAlign: "center", mt: 15 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ textAlign: "center", mb: 6 }}>
        {category === "bats"
          ? "야구배트"
          : category === "batting-gloves"
          ? "배팅장갑"
          : category === "protection"
          ? "보호장비"
          : category === "shoes"
          ? "야구화"
          : "글러브"}{" "}
        목록
      </Typography>

      <Grid container spacing={2} justifyContent="flex-start">
        {displayedProducts.length > 0 ? (
          displayedProducts.map((product) => {
            const discounted = product.discounted || false;
            const displayPrice = discounted
              ? calculateDiscountedPrice(product.originalPrice, product.discountPercent)
              : product.price;

            return (
              <Grid item xs={12} sm={6} md={3} key={product.id}>
                <Card
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
                    borderRadius: 4,
                    cursor: "pointer", // 클릭 가능 표시
                  }}
                  onClick={() => navigate(`/product/${product.id}`)} // 상세 페이지로 이동
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={product.image || "https://placehold.co/300x200"}
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
                      {discounted && (
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
                            {product.originalPrice?.toLocaleString()}원
                          </Typography>
                          <Typography variant="body1" color="error" sx={{ fontSize: "14px" }}>
                            {product.discountPercent}% OFF
                          </Typography>
                        </Box>
                      )}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          mb: 1,
                        }}
                      >
                        <Typography variant="h6" color="primary" sx={{ fontSize: "16px" }}>
                          {displayPrice.toLocaleString()}원
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
              </Grid>
            );
          })
        ) : (
          <Typography variant="h6" color="textSecondary" sx={{ mt: 5 }}>
            해당 카테고리에 상품이 없습니다.
          </Typography>
        )}
      </Grid>

      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, value) => setCurrentPage(value)}
            color="primary"
            size="large"
          />
        </Box>
      )}
    </Container>
  );
}