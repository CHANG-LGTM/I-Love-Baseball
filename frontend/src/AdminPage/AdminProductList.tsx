// AdminProductList.tsx
import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import axios from "axios";
import { Product } from "../types/Product";
import { useAuth } from "../AdminPage/AuthContext";

const AdminProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isAdmin, checkAuth } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const isAuthenticated = await checkAuth();

      if (!isAuthenticated || !isAdmin) {
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get("http://localhost:8092/api/admin/products", {
          withCredentials: true,
        });
        setProducts(response.data);
        setError(null);
      } catch (err: any) {
        console.error("상품 목록 불러오기 실패:", err);
        if (err.response?.status === 403) {
          setError("관리자 권한이 필요합니다.");
          setTimeout(() => navigate("/login"), 2000);
        } else {
          setError("상품 목록을 불러오는데 실패했습니다.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [navigate, isAdmin, checkAuth]);

  const handleDelete = async (id: number) => {
    if (window.confirm("정말로 이 상품을 삭제하시겠습니까?")) {
      try {
        await axios.delete(`http://localhost:8092/api/admin/products/${id}`, {
          withCredentials: true,
        });
        setProducts(products.filter((product) => product.id !== id));
      } catch (err: any) {
        setError("상품 삭제에 실패했습니다.");
      }
    }
  };

  if (loading) {
    return <CircularProgress sx={{ display: "block", mx: "auto", mt: 5 }} />;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 12 }}>
      <Typography variant="h4" gutterBottom>
        상품 관리
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate("/admin/products/new")}
        sx={{ mb: 3 }}
      >
        상품 등록
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>이름</TableCell>
              <TableCell>카테고리</TableCell>
              <TableCell>가격</TableCell>
              <TableCell>재고</TableCell>
              <TableCell>브랜드</TableCell>
              <TableCell>작업</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.id}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
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
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default AdminProductList;