import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Paper,
  CircularProgress,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Grid,
  Card,
  CardContent,
  SelectChangeEvent,
} from "@mui/material";
import axios, { AxiosError } from "axios";
import { Product } from "../types/Product";
import debounce from "lodash/debounce";

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL || "http://localhost:8092";
const BASE_IMAGE_URL = `${API_BASE_URL}/uploads/`;

const categoryMap: Record<string, string> = {
  bats: "야구배트",
  "batting-gloves": "배팅장갑",
  protection: "보호장비",
  gloves: "글러브",
  shoes: "야구화",
};

const AdminProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [brandFilter, setBrandFilter] = useState<string>("");
  const navigate = useNavigate();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get<Product[]>(`${API_BASE_URL}/api/admin/products`, {
        withCredentials: true,
      });
      setProducts(response.data);
      setFilteredProducts(response.data);
      setError(null);
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      setError(
        axiosError.response?.data?.message || 
        axiosError.response?.data?.error || 
        "상품 목록을 불러오는데 실패했습니다."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const debouncedSetSearchTerm = useMemo(
    () => debounce((value: string) => setSearchTerm(value), 300),
    []
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      debouncedSetSearchTerm(e.target.value);
    },
    [debouncedSetSearchTerm]
  );

  const filtered = useMemo(() => {
    let result = products;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (product) =>
          product.name?.toLowerCase().includes(term) ||
          product.brand?.toLowerCase().includes(term)
      );
    }

    if (categoryFilter) {
      result = result.filter((product) => product.category === categoryFilter);
    }

    if (brandFilter) {
      result = result.filter((product) => product.brand === brandFilter);
    }

    return result;
  }, [searchTerm, categoryFilter, brandFilter, products]);

  useEffect(() => {
    setFilteredProducts(filtered);
  }, [filtered]);

  const { totalStock, totalStockValue } = useMemo(() => {
    return filteredProducts.reduce(
      (acc, product) => ({
        totalStock: acc.totalStock + (product.stock || 0),
        totalStockValue: acc.totalStockValue + (product.stock || 0) * (product.price || 0),
      }),
      { totalStock: 0, totalStockValue: 0 }
    );
  }, [filteredProducts]);

  const categories = useMemo(() => 
    Array.from(new Set(products.map((product) => product.category).filter(Boolean))), 
    [products]
  );

  const brands = useMemo(() => 
    Array.from(new Set(products.map((product) => product.brand).filter(Boolean))), 
    [products]
  );

  const handleDelete = useCallback(async (id: number) => {
    if (window.confirm("정말로 이 상품을 삭제하시겠습니까?")) {
      try {
        await axios.delete(`${API_BASE_URL}/api/admin/products/${id}`, {
          withCredentials: true,
        });
        setProducts((prev) => prev.filter((product) => product.id !== id));
      } catch (err) {
        const axiosError = err as AxiosError<ApiErrorResponse>;
        setError(
          axiosError.response?.data?.message || 
          "상품 삭제에 실패했습니다."
        );
      }
    }
  }, []);

  const getImageSrc = useCallback((image?: string): string => {
    if (!image) return "/path/to/fallback-image.jpg";
    if (image.startsWith("data:image") || image.startsWith("http")) {
      return image;
    }
    const fileName = image.split("/").pop() || "";
    return `${BASE_IMAGE_URL}${encodeURIComponent(fileName)}`;
  }, []);

  const handleCategoryChange = useCallback(
    (e: SelectChangeEvent<string>) => {
      setCategoryFilter(e.target.value);
    },
    []
  );

  const handleBrandChange = useCallback(
    (e: SelectChangeEvent<string>) => {
      setBrandFilter(e.target.value);
    },
    []
  );

  if (loading) {
    return <CircularProgress sx={{ display: "block", mx: "auto", mt: 5 }} />;
  }

  if (error) {
    return (
      <Box sx={{ 
        flex: 1, 
        pb: "80px",
        maxWidth: {
          xs: "375px",
          sm: "600px",
          md: "900px",
          lg: "1200px",
          xl: "1536px",
        },
        width: "100%",
        mx: "auto",
        mt: 12
      }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      flex: 1, 
      pb: "80px",
      maxWidth: {
        xs: "375px",
        sm: "600px",
        md: "900px",
        lg: "1200px",
        xl: "1536px",
      },
      width: "100%",
      mx: "auto",
      mt: 12,
      mb: 5
    }}>
      <Typography variant="h4" gutterBottom align="center">
        상품 관리
      </Typography>

      <Box sx={{ mb: 3, width: "100%" }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              label="상품명 또는 브랜드 검색"
              onChange={handleSearchChange}
              fullWidth
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>카테고리</InputLabel>
              <Select
                value={categoryFilter}
                onChange={handleCategoryChange}
                label="카테고리"
              >
                <MenuItem value="">전체</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {categoryMap[category] || category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>브랜드</InputLabel>
              <Select
                value={brandFilter}
                onChange={handleBrandChange}
                label="브랜드"
              >
                <MenuItem value="">전체</MenuItem>
                {brands.map((brand) => (
                  <MenuItem key={brand} value={brand}>
                    {brand}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/admin/products/new")}
        >
          상품 등록
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ 
        width: "100%", 
        minHeight: 500, 
        maxHeight: 400, 
        overflow: "auto" 
      }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>이미지</TableCell>
              <TableCell>이름</TableCell>
              <TableCell>카테고리</TableCell>
              <TableCell>가격</TableCell>
              <TableCell>재고</TableCell>
              <TableCell>브랜드</TableCell>
              <TableCell>작업</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body2" color="textSecondary">
                    검색된 상품이 없습니다.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.id}</TableCell>
                  <TableCell>
                    {product.image ? (
                      <img
                        src={getImageSrc(product.image)}
                        alt={product.name}
                        style={{ width: 50, height: 50, objectFit: "cover" }}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/path/to/fallback-image.jpg";
                        }}
                      />
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        이미지 없음
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{categoryMap[product.category] || product.category}</TableCell>
                  <TableCell>{product.price?.toLocaleString()}원</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>{product.brand}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                      sx={{ mr: 1 }}
                    >
                      수정
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleDelete(product.id!)}
                    >
                      삭제
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 12 }}>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} sm={6}>
            <Card sx={{ 
              minHeight: 120, 
              width: "100%",
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center" 
            }}>
              <CardContent>
                <Typography variant="h6" align="center">
                  총 재고 수량
                </Typography>
                <Typography variant="h5" align="center">
                  {totalStock} 개
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card sx={{ 
              minHeight: 120, 
              width: "100%",
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center" 
            }}>
              <CardContent>
                <Typography variant="h6" align="center">
                  총 재고 가격
                </Typography>
                <Typography variant="h5" align="center">
                  {totalStockValue.toLocaleString()} 원
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default AdminProductList;