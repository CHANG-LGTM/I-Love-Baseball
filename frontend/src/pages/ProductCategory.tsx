import React, { useEffect, useState, useMemo, useCallback } from "react";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
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
  brand: string;
}

interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface BrandCount {
  brand: string;
  count: number;
}

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL || "http://localhost:8092";
const BASE_IMAGE_URL = `${API_BASE_URL}/uploads/`;

export default function ProductCategory() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 16;
  const [cart, setCart] = useState<number[]>([]);
  const [sortOption, setSortOption] = useState<string>("all");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [brands, setBrands] = useState<BrandCount[]>([{ brand: "all", count: 0 }]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const getImageSrc = useCallback((image: string | undefined): string => {
    if (!image) return "/path/to/fallback-image.jpg";
    if (image.startsWith("data:image") || image.startsWith("http")) {
      return image;
    }
    const fileName = image.split("/").pop() || "";
    return `${BASE_IMAGE_URL}${encodeURIComponent(fileName)}`;
  }, []);

  const fetchData = useCallback(async () => {
    setPageLoading(true);
    setError(null);
    setProducts([]);
    setBrands([{ brand: "all", count: 0 }]);

    const token = localStorage.getItem("token") || "";

    try {
      const [brandsResponse, productsResponse] = await Promise.all([
        axios.get<BrandCount[]>(`${API_BASE_URL}/api/products/brands/${category}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get<Product[]>(`${API_BASE_URL}/api/products/category/${category}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const fetchedBrands = brandsResponse.data || [];
      const updatedBrands = [
        { brand: "all", count: productsResponse.data.length },
        ...fetchedBrands,
      ];
      setBrands(updatedBrands);

      const responseProducts = productsResponse.data.map((item) => ({
        ...item,
        image: getImageSrc(item.image),
        brand: item.brand || "Unknown",
      }));

      setProducts(responseProducts);

      if (responseProducts.length === 0) {
        setError("해당 카테고리에 상품이 없습니다.");
      }
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      setError(
        axiosError.response?.data?.message || 
        axiosError.response?.data?.error || 
        "상품 목록을 불러오는 데 실패했습니다."
      );
      setBrands([{ brand: "all", count: 0 }]);
      setProducts([]);
    } finally {
      setPageLoading(false);
    }
  }, [category, getImageSrc]);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem("token") || "";
        await axios.get(`${API_BASE_URL}/api/auth/check-auth`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        localStorage.removeItem("nickname");
      }
    };

    setBrandFilter("all");
    setCurrentPage(1);
    checkAuthStatus().then(fetchData);
  }, [category, fetchData]);

  useEffect(() => {
    if (brandFilter === "all") {
      fetchData();
    } else {
      const fetchFilteredProducts = async () => {
        setPageLoading(true);
        setError(null);
        setProducts([]);

        const token = localStorage.getItem("token") || "";

        try {
          const productsResponse = await axios.get<Product[]>(
            `${API_BASE_URL}/api/products/category/${category}?brand=${brandFilter}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const responseProducts = productsResponse.data.map((item) => ({
            ...item,
            image: getImageSrc(item.image),
            brand: item.brand || "Unknown",
          }));

          setProducts(responseProducts);

          if (responseProducts.length === 0) {
            setError(`선택한 브랜드(${brandFilter})의 상품이 없습니다.`);
          }
        } catch (err) {
          const axiosError = err as AxiosError<ApiErrorResponse>;
          setError(
            axiosError.response?.data?.message || 
            axiosError.response?.data?.error || 
            "상품 목록을 불러오는 데 실패했습니다."
          );
          setProducts([]);
        } finally {
          setPageLoading(false);
        }
      };

      fetchFilteredProducts();
    }
  }, [brandFilter, category, getImageSrc]);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const res = await axios.get<CartItem[]>(`${API_BASE_URL}/api/cart`, {
          withCredentials: true,
        });
        const formattedItems = res.data.map((item) => ({
          id: item.id,
          productId: item.productId,
          name: item.name || "상품명 없음",
          price: item.price || 0,
          image: getImageSrc(item.image),
          quantity: item.quantity || 1,
        }));
        setCartItems(formattedItems);
        setCart(formattedItems.map((item) => item.productId));
      } catch (err) {
        const axiosError = err as AxiosError<ApiErrorResponse>;
        setError(
          axiosError.response?.data?.message || 
          axiosError.response?.data?.error || 
          "장바구니 데이터를 불러오는 데 실패했습니다"
        );
      }
    };
    fetchCartItems();
  }, [getImageSrc]);

  const sortedProducts = useMemo(() => {
    const sorted = [...products];
    switch (sortOption) {
      case "priceHigh":
        return sorted.sort((a, b) => b.price - a.price);
      case "priceLow":
        return sorted.sort((a, b) => a.price - b.price);
      default:
        return sorted;
    }
  }, [products, sortOption]);

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const displayedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
        const cartItem = cartItems.find((item) => item.productId === productId);
        if (cartItem) {
          await axios.delete(`${API_BASE_URL}/api/cart/remove/${cartItem.id}`, {
            withCredentials: true,
          });
          setCart(cart.filter((id) => id !== productId));
          setCartItems(cartItems.filter((item) => item.productId !== productId));
        }
      } else {
        await axios.post(
          `${API_BASE_URL}/api/cart/add`,
          { productId },
          { withCredentials: true }
        );
        const res = await axios.get<CartItem[]>(`${API_BASE_URL}/api/cart`, {
          withCredentials: true,
        });
        const formattedItems = res.data.map((item) => ({
          id: item.id,
          productId: item.productId,
          name: item.name || "상품명 없음",
          price: item.price || 0,
          image: getImageSrc(item.image),
          quantity: item.quantity || 1,
        }));
        setCartItems(formattedItems);
        setCart([...cart, productId]);
      }
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      alert(
        axiosError.response?.data?.message || 
        axiosError.response?.data?.error || 
        "장바구니 처리 중 오류가 발생했습니다."
      );
    }
  };

  const handlePurchase = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    const nickname = localStorage.getItem("nickname");
    const isLoggedIn = !!nickname;
    if (pageLoading || !isLoggedIn) {
      if (!isLoggedIn && window.confirm("로그인 후 이용 가능합니다. 로그인 하시겠습니까?")) {
        navigate("/login");
      }
      return;
    }

    const cartItem: CartItem = {
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.discounted
        ? calculateDiscountedPrice(product.originalPrice, product.discountPercent)
        : product.price,
      image: product.image,
      quantity: 1,
    };

    navigate("/purchase", { state: { cartItems: [cartItem] } });
  };

  const calculateDiscountedPrice = (
    originalPrice?: number | null, 
    discountPercent?: number | null
  ): number => {
    if (!originalPrice || !discountPercent) return originalPrice || 0;
    return Math.round(originalPrice * (1 - discountPercent / 100));
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [sortOption, brandFilter]);

  const gridJustifyContent = displayedProducts.length <= 3 ? "center" : "flex-start";

  return (
    <Container maxWidth="lg" sx={{ textAlign: "center", mt: 15 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ textAlign: "center", mb: 4 }}>
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

      {pageLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!pageLoading && error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
          {brandFilter !== "all" && (
            <Button
              variant="outlined"
              color="primary"
              onClick={() => {
                setBrandFilter("all");
                setError(null);
                setPageLoading(true);
              }}
              sx={{ ml: 2 }}
            >
              브랜드 필터 초기화
            </Button>
          )}
        </Alert>
      )}

      {!pageLoading && !error && (
        <>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>정렬 기준</InputLabel>
              <Select
                value={sortOption}
                label="정렬 기준"
                onChange={(e) => setSortOption(e.target.value as string)}
              >
                <MenuItem value="all">기본 정렬</MenuItem>
                <MenuItem value="priceHigh">가격 높은 순</MenuItem>
                <MenuItem value="priceLow">가격 낮은 순</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>브랜드</InputLabel>
              <Select
                value={brandFilter}
                label="브랜드"
                onChange={(e) => setBrandFilter(e.target.value as string)}
              >
                {brands.map((brandItem) => (
                  <MenuItem key={brandItem.brand} value={brandItem.brand}>
                    {brandItem.brand === "all" ? "전체" : brandItem.brand} ({brandItem.count})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {displayedProducts.length > 0 ? (
            <Grid container spacing={2} justifyContent={gridJustifyContent}>
              {displayedProducts.map((product) => {
                const discounted = product.discounted || false;
                const displayPrice = discounted
                  ? calculateDiscountedPrice(product.originalPrice, product.discountPercent)
                  : product.price;

                return (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={3}
                    key={product.id}
                    sx={{ display: "flex", justifyContent: "center", alignItems: "center", minWidth: "250px" }}
                  >
                    <Card
                      sx={{
                        width: "250px",
                        height: "450px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        transition: "all 0.3s",
                        "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.1)", transform: "translateY(-4px)" },
                        borderRadius: 4,
                        cursor: "pointer",
                      }}
                    >
                      <CardMedia
                        component="img"
                        height="200"
                        image={product.image}
                        alt={product.name}
                        sx={{ objectFit: "contain" }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/path/to/fallback-image.jpg";
                        }}
                        onClick={() => navigate(`/product/${product.id}`)}
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
                          {discounted ? (
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                gap: 1,
                                mb: 1,
                                minHeight: "24px",
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
                          ) : (
                            <Box sx={{ minHeight: "24px", mb: 1 }} />
                          )}
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              mb: 1,
                              minHeight: "24px",
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
                              gap: 2,
                              minHeight: "48px",
                            }}
                          >
                            <Button
                              variant="contained"
                              color="primary"
                              size="medium"
                              sx={{ fontSize: "20px", padding: "8px 20px", borderRadius: "8px" }}
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
                  </Grid>
                );
              })}
            </Grid>
          ) : (
            <Typography variant="h6" color="textSecondary" sx={{ mt: 5 }}>
              해당 카테고리에 상품이 없습니다.
            </Typography>
          )}

          {totalPages > 1 && displayedProducts.length > 0 && (
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
        </>
      )}
    </Container>
  );
}