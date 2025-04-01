import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
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
} from "@mui/material";
import axios from "axios";
import { Product } from "../types/Product";
import debounce from "lodash/debounce";

// 카테고리 매핑 (영어 → 한국어)
const categoryMap: { [key: string]: string } = {
  bats: "야구배트",
  "batting-gloves": "배팅장갑",
  protection: "보호장비",
  gloves: "글러브",
  shoes: "야구화",
};

// 백엔드 이미지 API 기본 URL
const BASE_IMAGE_URL = "http://localhost:8092/uploads/";

const AdminProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [brandFilter, setBrandFilter] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:8092/api/admin/products", {
          withCredentials: true,
        });
        console.log("Fetched products:", response.data); // 디버깅용 출력
        setProducts(response.data);
        setFilteredProducts(response.data);
        setError(null);
      } catch (err: unknown) {
        console.error("상품 목록 불러오기 실패:", err);
        setError("상품 목록을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // 디바운싱된 검색어 업데이트 함수
  const debouncedSetSearchTerm = useCallback(
    debounce((value: string) => {
      setSearchTerm(value);
    }, 300),
    []
  );

  // 검색어 입력 핸들러
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSetSearchTerm(e.target.value);
  };

  // 필터링 로직 (useMemo로 최적화)
  const filtered = useMemo(() => {
    let result = products;

    if (searchTerm) {
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.brand.toLowerCase().includes(searchTerm.toLowerCase())
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

  // 재고 및 총 재고 가격 계산
  const totalStock = filteredProducts.reduce((sum, product) => sum + product.stock, 0);
  const totalStockValue = filteredProducts.reduce(
    (sum, product) => sum + product.stock * product.price,
    0
  );

  const categories = Array.from(new Set(products.map((product) => product.category)));
  const brands = Array.from(new Set(products.map((product) => product.brand)));

  const handleDelete = async (id: number) => {
    if (window.confirm("정말로 이 상품을 삭제하시겠습니까?")) {
      try {
        await axios.delete(`http://localhost:8092/api/admin/products/${id}`, {
          withCredentials: true,
        });
        setProducts(products.filter((product) => product.id !== id));
      } catch (err: unknown) {
        setError("상품 삭제에 실패했습니다.");
      }
    }
  };

  // 이미지 URL을 결정하는 함수
  const getImageSrc = (image: string | undefined): string => {
    if (!image) {
      return "";
    }
    console.log("product.image:", image); // 디버깅용 출력
    if (image.startsWith("data:image")) {
      return image;
    }
    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }
    // 전체 경로에서 파일 이름만 추출
    const fileName = image.split("/").pop();
    // 파일 이름을 URL 인코딩
    const encodedFileName = encodeURIComponent(fileName || "");
    const imageUrl = `${BASE_IMAGE_URL}${encodedFileName}`;
    console.log("Generated image URL:", imageUrl); // 디버깅용 출력
    return imageUrl;
  };

  const handleCategoryChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setCategoryFilter(e.target.value as string);
  };

  const handleBrandChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setBrandFilter(e.target.value as string);
  };

  if (loading) {
    return <CircularProgress sx={{ display: "block", mx: "auto", mt: 5 }} />;
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 12 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 12, mb: 5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="h4" gutterBottom>
        상품 관리
      </Typography>

      <Box sx={{ mb: 3, width: '100%', display: 'flex', justifyContent: 'center' }}>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12} sm={4}>
            <TextField
              label="상품명 또는 브랜드 검색"
              onChange={handleSearchChange}
              fullWidth
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth variant="outlined">
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
            <FormControl fullWidth variant="outlined">
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

      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate("/admin/products/new")}
        sx={{ mb: 3 }}
      >
        상품 등록
      </Button>

      <TableContainer component={Paper} sx={{ width: 1300, minHeight: 500, maxHeight: 400, overflow: "auto" }}>
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
                          console.error("Image load failed:", getImageSrc(product.image));
                          e.currentTarget.src = "/path/to/fallback-image.jpg"; // 에러 발생 시 대체 이미지
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
                  <TableCell>{product.price.toLocaleString()}원</TableCell>
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
            <Card sx={{ minHeight: 120, minWidth: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
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
            <Card sx={{ minHeight: 120, minWidth: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
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
    </Container>
  );
};

export default AdminProductList;