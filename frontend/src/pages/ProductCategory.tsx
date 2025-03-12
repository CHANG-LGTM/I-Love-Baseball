import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
import { Product, DiscountedProduct } from "../types";

export default function ProductCategory() {
  const { category } = useParams<{ category: string }>();
  const [products, setProducts] = useState<(Product | DiscountedProduct)[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16; // 한 페이지당 16개 (4x4)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // 일반 상품 가져오기 (현재 카테고리만)
        const normalRes = await axios.get(`http://localhost:8092/api/products/category/${category}`);
        const normalProducts: Product[] = normalRes.data;

        // 할인 상품 가져오기 (모든 카테고리)
        const discountedRes = await axios.get("http://localhost:8092/api/products/discounted-products");
        const allDiscountedProducts: DiscountedProduct[] = discountedRes.data;

        // 현재 카테고리에 해당하는 할인 상품만 필터링
        const categoryDiscounted = allDiscountedProducts.filter(
          (product) => product.category === category
        );

        // 해당 카테고리의 할인 상품 중 4~5개 무작위 선택
        const shuffledDiscounted = categoryDiscounted.sort(() => 0.5 - Math.random());
        const selectedDiscounted = shuffledDiscounted.slice(0, Math.floor(Math.random() * 2) + 4); // 4~5개

        // 현재 카테고리의 일반 상품과 할인 상품 결합 (중복 제거 후 섞기)
        const allProducts = [...normalProducts, ...selectedDiscounted].filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.id === item.id)
        ).sort(() => 0.5 - Math.random()); // 무작위 섞기

        setProducts(allProducts.slice(0, itemsPerPage)); // 처음에 16개만 로드
      } catch (err) {
        console.error("상품 목록 불러오기 오류:", err);
      }
    };
    fetchProducts();
  }, [category]);

  // 페이지네이션
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const displayedProducts = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // 장바구니 상태 관리
  const [cart, setCart] = useState<number[]>([]);

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

  const calculateDiscountedPrice = (originalPrice: number, discountPercent: number) => {
    return Math.round(originalPrice * (1 - discountPercent / 100));
  };

  return (
    <Container maxWidth="lg" sx={{ textAlign: "center", mt: 15 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ textAlign: "center", mb: 6 }}>
        {category === "bats" ? "야구배트"
          : category === "batting-gloves" ? "배팅장갑"
          : category === "protection" ? "보호장비"
          : category === "shoes" ? "야구화"
          : "글러브"} 목록
      </Typography>

      <Grid container spacing={2} justifyContent="flex-start">
        {displayedProducts.length > 0 ? (
          displayedProducts.map((product) => {
            const isDiscounted = "discountPercent" in product;
            const displayPrice = isDiscounted
              ? calculateDiscountedPrice(product.originalPrice, product.discountPercent)
              : product.price;
            const originalPrice = isDiscounted ? product.originalPrice : null;

            return (
              <Grid item xs={12} sm={6} md={3} key={product.id}>
                <Card
                  sx={{
                    width: 240,
                    height: 340,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    transition: "all 0.3s",
                    "&:hover": {
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      transform: "translateY(-4px)",
                    },
                    padding: 1,
                    borderRadius: 4,
                  }}
                >
                  <CardMedia
                    component="img"
                    height="160"
                    image={product.image || product.imageUrl || "https://placehold.co/300x200"}
                    alt={product.name}
                    sx={{ objectFit: "contain", width: "100%" }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://placehold.co/300x200";
                    }}
                  />
                  <CardContent
                    sx={{
                      padding: "8px",
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
                          fontSize: "14px",
                          lineHeight: "1.1",
                          minHeight: "32px",
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
                          fontSize: "12px",
                          lineHeight: "1.2",
                          minHeight: "36px",
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
                      {isDiscounted && (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: 0.5,
                            mb: 0.5,
                          }}
                        >
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ textDecoration: "line-through", fontSize: "12px" }}
                          >
                            {originalPrice?.toLocaleString()}원
                          </Typography>
                          <Typography variant="body2" color="error" sx={{ fontSize: "12px" }}>
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
                        <Typography variant="h6" color="primary" sx={{ fontSize: "14px" }}>
                          {displayPrice.toLocaleString()}원
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          sx={{
                            fontSize: "12px",
                            padding: "4px 12px",
                            borderRadius: 4,
                          }}
                          onClick={() => handlePurchase(product.id)}
                        >
                          구매하기
                        </Button>
                        <Box
                          onClick={() => toggleCart(product.id)}
                          sx={{
                            cursor: "pointer",
                            padding: 0,
                            "&:focus": { outline: "none" },
                            "&:hover": { backgroundColor: "transparent" },
                          }}
                        >
                          {cart.includes(product.id) ? (
                            <FavoriteIcon sx={{ color: "red", fontSize: "20px" }} />
                          ) : (
                            <FavoriteBorderIcon sx={{ color: "grey", fontSize: "20px" }} />
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