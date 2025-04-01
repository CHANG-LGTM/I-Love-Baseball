import { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Paper,
  Fade,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating, // 별점 컴포넌트 추가
} from "@mui/material";
import { CameraAlt, Close } from "@mui/icons-material";
import axios from "axios";
import { useAuth } from "../AdminPage/AuthContext";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    backgroundColor: "#f9f9f9",
    "&:hover fieldset": {
      borderColor: theme.palette.primary.main,
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
    },
  },
  "& .MuiInputLabel-root": {
    color: theme.palette.text.secondary,
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: theme.palette.primary.main,
  },
}));

const ImagePreview = styled("div")({
  position: "relative",
  marginTop: "16px",
  "& img": {
    maxWidth: "100%",
    maxHeight: "300px",
    borderRadius: "12px",
    objectFit: "cover",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
});

const RemoveImageButton = styled(IconButton)({
  position: "absolute",
  top: "8px",
  right: "8px",
  backgroundColor: "rgba(0,0,0,0.5)",
  color: "white",
  "&:hover": {
    backgroundColor: "rgba(0,0,0,0.7)",
  },
});

const ReviewFormPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: "16px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  backgroundColor: "#fff",
  position: "relative",
  marginBottom: theme.spacing(4),
}));

interface Product {
  id: number;
  name: string;
}

export default function WriteReview() {
  const { nickname } = useAuth();
  const navigate = useNavigate();
  const [review, setReview] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState<number | null>(null);
  const [rating, setRating] = useState<number | null>(null); // 별점 상태 추가
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!nickname) {
      setError("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    // 상품 목록 가져오기
    const fetchProducts = async () => {
      try {
        const response = await axios.get<Product[]>("http://localhost:8092/api/products", {
          withCredentials: true,
        });
        setProducts(response.data);
      } catch (err) {
        setError("상품 목록을 불러오는 데 실패했습니다.");
      }
    };

    fetchProducts();
  }, [nickname, navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setError("이미지 크기는 5MB를 초과할 수 없습니다.");
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!nickname) {
      setError("로그인이 필요합니다.");
      navigate("/login");
      return;
    }
    if (!review.trim()) {
      setError("리뷰 내용을 입력해주세요.");
      return;
    }
    if (!productId) {
      setError("상품을 선택해주세요.");
      return;
    }
    if (!rating) {
      setError("별점을 선택해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("content", review);
      formData.append("productId", productId.toString());
      formData.append("rating", rating.toString()); // 별점 추가
      if (image) {
        formData.append("image", image);
      }

      await axios.post("http://localhost:8092/api/reviews", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      setReview("");
      setImage(null);
      setImagePreview(null);
      setProductId(null);
      setRating(null);
      setError(null);
      setSuccess("리뷰가 성공적으로 작성되었습니다.");
      // 리뷰 제출 후 ReviewList 페이지로 이동
      setTimeout(() => navigate("/review-list"), 2000);
    } catch (err) {
      console.error("리뷰 작성 실패:", err);
      setError("리뷰 작성에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <Box
      sx={{
        padding: { xs: 2, md: 15 },
        marginTop: 8,
        maxWidth: "900px",
        margin: "0 auto",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: "bold",
          mb: 5,
          color: "#1976d2",
          textAlign: "center",
          textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
        }}
      >
        📝 리뷰 작성
      </Typography>

      <Fade in={true} timeout={1000}>
        <ReviewFormPaper elevation={3}>
          <Typography
            variant="h6"
            sx={{ mb: 2, fontWeight: "medium", color: "#333" }}
          >
            리뷰 작성하기
          </Typography>
          <TextField
            label="닉네임"
            value={nickname || ""}
            disabled
            fullWidth
            sx={{ mb: 3 }}
          />
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>상품 선택</InputLabel>
            <Select
              value={productId || ""}
              onChange={(e) => setProductId(Number(e.target.value))}
              label="상품 선택"
            >
              {products.map((product) => (
                <MenuItem key={product.id} value={product.id}>
                  {product.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ mb: 3 }}>
            <Typography component="legend">별점</Typography>
            <Rating
              name="rating"
              value={rating}
              onChange={(event, newValue) => {
                setRating(newValue);
              }}
              precision={1}
            />
          </Box>
          <StyledTextField
            label="리뷰를 작성해주세요"
            multiline
            rows={4}
            value={review}
            onChange={(e) => setReview(e.target.value)}
            fullWidth
            sx={{ mb: 3 }}
          />

          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CameraAlt />}
              sx={{
                borderRadius: "20px",
                borderColor: "#1976d2",
                color: "#1976d2",
                "&:hover": {
                  borderColor: "#1565c0",
                  backgroundColor: "rgba(25, 118, 210, 0.04)",
                },
              }}
            >
              사진 첨부
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageChange}
                ref={fileInputRef}
              />
            </Button>

            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={isLoading || !productId || !rating}
              sx={{
                borderRadius: "20px",
                background: "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
                color: "white",
                px: 4,
                "&:hover": {
                  background:
                    "linear-gradient(45deg, #1565c0 30%, #2196f3 90%)",
                },
              }}
            >
              {isLoading ? <CircularProgress size={24} /> : "리뷰 등록"}
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setReview("");
                setImage(null);
                setImagePreview(null);
                setProductId(null);
                setRating(null);
              }}
              sx={{
                borderRadius: "20px",
                borderColor: "#bdbdbd",
                color: "#757575",
                "&:hover": {
                  borderColor: "#9e9e9e",
                  backgroundColor: "rgba(0,0,0,0.04)",
                },
              }}
            >
              취소
            </Button>
            <IconButton
              sx={{
                position: "absolute",
                top: 12,
                right: 12,
                backgroundColor: "grey.200",
                "&:hover": { backgroundColor: "grey.300" },
              }}
              onClick={() => {
                setReview("");
                setImage(null);
                setImagePreview(null);
                setProductId(null);
                setRating(null);
              }}
            >
              <Close />
            </IconButton>
          </Box>

          {imagePreview && (
            <ImagePreview>
              <img
                src={imagePreview}
                alt="미리보기"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "/path/to/fallback-image.jpg";
                }}
              />
              <RemoveImageButton size="small" onClick={removeImage}>
                <Close />
              </RemoveImageButton>
            </ImagePreview>
          )}
        </ReviewFormPaper>
      </Fade>

      <Snackbar
        open={!!error || !!success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={error ? "error" : "success"}
          sx={{ width: "100%" }}
        >
          {error || success}
        </Alert>
      </Snackbar>
    </Box>
  );
}