// src/pages/admin/AdminProductForm.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Alert,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { Product } from "../types/Product";
import { useAuth } from "./AuthContext";

const AdminProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin, checkAuth } = useAuth();
  const [product, setProduct] = useState<Product>({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    category: "",
    image: "",
    discounted: false,
    originalPrice: null,
    discountPercent: null,
    brand: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      await checkAuth(); // 인증 상태 확인

      if (!isAdmin) {
        navigate("/login");
        return;
      }

      if (id) {
        try {
          const response = await axios.get(`http://localhost:8092/api/admin/products/${id}`, {
            withCredentials: true,
          });
          setProduct(response.data);
          setError(null);
        } catch (err: any) {
          setError("상품 정보를 불러오는데 실패했습니다.");
        }
      }
      setLoading(false);
    };
    initialize();
  }, [id, isAdmin, navigate, checkAuth]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name as string]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProduct((prev) => ({ ...prev, discounted: e.target.checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (id) {
        await axios.put(`http://localhost:8092/api/admin/products/${id}`, product, {
          withCredentials: true,
        });
      } else {
        await axios.post("http://localhost:8092/api/admin/products", product, {
          withCredentials: true,
        });
      }
      navigate("/admin/products");
    } catch (err: any) {
      setError("상품 저장에 실패했습니다.");
    }
  };

  if (loading) {
    return <CircularProgress sx={{ display: "block", mx: "auto", mt: 5 }} />;
  }

  if (!isAdmin) {
    return null; // 리다이렉트 처리 중이므로 아무것도 렌더링하지 않음
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 12 }}>
      <Typography variant="h4" gutterBottom>
        {id ? "상품 수정" : "상품 등록"}
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField
          label="상품명"
          name="name"
          value={product.name}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <TextField
          label="설명"
          name="description"
          value={product.description}
          onChange={handleChange}
          fullWidth
          multiline
          rows={4}
          sx={{ mb: 2 }}
        />
        <TextField
          label="가격"
          name="price"
          type="number"
          value={product.price}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <TextField
          label="재고"
          name="stock"
          type="number"
          value={product.stock}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>카테고리</InputLabel>
          <Select
            name="category"
            value={product.category}
            onChange={handleChange}
            required
          >
            <MenuItem value="bats">야구배트</MenuItem>
            <MenuItem value="batting-gloves">배팅장갑</MenuItem>
            <MenuItem value="protection">보호장비</MenuItem>
            <MenuItem value="gloves">글러브</MenuItem>
            <MenuItem value="shoes">야구화</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="이미지 URL"
          name="image"
          value={product.image}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="브랜드"
          name="brand"
          value={product.brand}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={product.discounted}
              onChange={handleCheckboxChange}
              name="discounted"
            />
          }
          label="할인 여부"
        />
        {product.discounted && (
          <>
            <TextField
              label="원래 가격"
              name="originalPrice"
              type="number"
              value={product.originalPrice || ""}
              onChange={handleChange}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="할인율 (%)"
              name="discountPercent"
              type="number"
              value={product.discountPercent || ""}
              onChange={handleChange}
              fullWidth
              sx={{ mb: 2 }}
            />
          </>
        )}
        <Box sx={{ mt: 3 }}>
          <Button type="submit" variant="contained" color="primary" sx={{ mr: 2 }}>
            {id ? "수정" : "등록"}
          </Button>
          <Button variant="outlined" onClick={() => navigate("/admin/products")}>
            취소
          </Button>
        </Box>
      </form>
    </Container>
  );
};

export default AdminProductForm;