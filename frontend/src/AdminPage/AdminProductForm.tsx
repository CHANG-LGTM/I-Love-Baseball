// src/pages/admin/AdminProductForm.tsx
import React, { useEffect, useState, useCallback } from "react";
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
    originalPrice: 0,
    discountPercent: 0,
    brand: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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
          const fetchedProduct = response.data;
          setProduct(fetchedProduct);
          setImagePreview(fetchedProduct.image || null); // 기존 이미지 미리보기 설정
          setError(null);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err: unknown) {
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

  // 이미지 파일 처리
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 드래그 앤 드롭 처리
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setError("이미지 파일만 업로드 가능합니다.");
    }
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let imageUrl = product.image;

      // 이미지 파일이 있는 경우 업로드
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        const uploadResponse = await axios.post("http://localhost:8092/api/admin/uploads", formData, {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        imageUrl = uploadResponse.data.url; // 서버에서 반환된 이미지 URL
      }

      const updatedProduct = { ...product, image: imageUrl };

      if (id) {
        await axios.put(`http://localhost:8092/api/admin/products/${id}`, updatedProduct, {
          withCredentials: true,
        });
      } else {
        await axios.post("http://localhost:8092/api/admin/products", updatedProduct, {
          withCredentials: true,
        });
      }
      navigate("/admin/products");
    } catch (err: unknown) {
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
      <Typography variant="h4" gutterBottom align="center">
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

        {/* 이미지 업로드 및 드래그 앤 드롭 영역 */}
        <Box
          sx={{
            border: "2px dashed #ccc",
            borderRadius: 2,
            p: 2,
            mb: 2,
            textAlign: "center",
            backgroundColor: "#f9f9f9",
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <Typography variant="body1" gutterBottom>
            이미지를 드래그하여 업로드하거나 클릭하여 파일 선택
          </Typography>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "none" }}
            id="image-upload"
          />
          <label htmlFor="image-upload">
            <Button variant="contained" component="span" sx={{ mb: 2 }}>
              파일 선택
            </Button>
          </label>
          {imagePreview && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">미리보기:</Typography>
              <img
                src={imagePreview}
                alt="미리보기"
                style={{ maxWidth: "100%", maxHeight: 200, objectFit: "contain" }}
              />
            </Box>
          )}
        </Box>

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