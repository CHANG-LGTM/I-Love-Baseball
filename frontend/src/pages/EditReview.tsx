import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../AdminPage/AuthContext";
import axios, { AxiosError } from "axios";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Rating,
  IconButton,
} from "@mui/material";
import { CameraAlt, Close } from "@mui/icons-material";
import { styled } from "@mui/material/styles";

interface Review {
  id: number;
  productName: string;
  rating: number;
  content: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  comments?: ReviewComment[];
}

interface ReviewComment {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  nickname: string;
}

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL || "http://localhost:8092";
const REVIEW_IMAGE_BASE_URL = import.meta.env.VITE_APP_REVIEW_IMAGE_BASE_URL || "http://localhost:8092/review_img/";
const FALLBACK_IMAGE = import.meta.env.VITE_APP_FALLBACK_IMAGE || "/images/fallback-image.jpg";

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

export default function EditReview() {
  const { id } = useParams<{ id: string }>();
  const { nickname } = useAuth();
  const navigate = useNavigate();
  const [review, setReview] = useState<Review | null>(null);
  const [content, setContent] = useState<string>("");
  const [rating, setRating] = useState<number | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getImageSrc = (image: string | undefined): string => {
    if (!image) return FALLBACK_IMAGE;
    if (image.startsWith("data:image") || image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }
    const fileName = image.split("/").pop();
    if (!fileName) return FALLBACK_IMAGE;
    return `${REVIEW_IMAGE_BASE_URL}${encodeURIComponent(fileName)}`;
  };

  const fetchReview = async () => {
    setLoading(true);
    try {
      const response = await axios.get<Review>(`${API_BASE_URL}/api/reviews/${id}`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      const reviewData = response.data;
      setReview(reviewData);
      setContent(reviewData.content);
      setRating(reviewData.rating);
      if (reviewData.imageUrl) {
        setImagePreview(getImageSrc(reviewData.imageUrl));
      }
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      if (axiosError.response?.status === 401) {
        setError("로그인이 필요합니다.");
        localStorage.removeItem("nickname");
        localStorage.removeItem("token");
        setTimeout(() => navigate("/login"), 2000);
      } else if (axiosError.response?.status === 404) {
        setError("리뷰를 찾을 수 없습니다.");
        setTimeout(() => navigate("/mypage"), 2000);
      } else {
        setError(
          axiosError.response?.data?.message ||
          axiosError.message ||
          "리뷰를 불러오는 데 실패했습니다."
        );
        setTimeout(() => navigate("/mypage"), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!nickname) {
      navigate("/login");
    } else {
      fetchReview();
    }
  }, [nickname, id, navigate]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
        navigate("/mypage");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

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
    setImagePreview(review?.imageUrl ? getImageSrc(review.imageUrl) : null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError("리뷰 내용을 입력해주세요.");
      return;
    }
    if (!rating) {
      setError("평점을 선택해주세요.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("nickname", nickname!);
      formData.append("content", content);
      formData.append("rating", rating.toString());
      if (image) {
        formData.append("image", image);
      }

      const response = await axios.put<Review>(
        `${API_BASE_URL}/api/reviews/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
          withCredentials: true,
        }
      );

      if (response.status === 403) {
        setError("본인이 작성한 리뷰만 수정할 수 있습니다.");
        return;
      }

      setSuccess("리뷰가 성공적으로 수정되었습니다.");
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      if (axiosError.response?.status === 401) {
        setError("로그인이 필요합니다.");
        localStorage.removeItem("nickname");
        localStorage.removeItem("token");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(
          axiosError.response?.data?.message ||
          axiosError.message ||
          "리뷰 수정에 실패했습니다."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && !review) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: "600px", mx: "auto", p: 3, mt: 8 }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", color: "#333", mb: 4, textAlign: "center" }}>
        리뷰 수정
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {review && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333" }}>
            상품명: {review.productName}
          </Typography>
          <Box>
            <Typography variant="body1" sx={{ mb: 1 }}>
              평점
            </Typography>
            <Rating
              value={rating}
              onChange={(event, newValue) => setRating(newValue)}
              precision={1}
              size="large"
            />
          </Box>
          <StyledTextField
            label="리뷰 내용"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            fullWidth
            multiline
            rows={4}
            variant="outlined"
          />
          <Box>
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
              사진 업로드
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageChange}
                ref={fileInputRef}
              />
            </Button>
          </Box>
          {imagePreview && (
            <ImagePreview>
              <img
                src={imagePreview}
                alt="미리보기"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                }}
              />
              <RemoveImageButton size="small" onClick={removeImage}>
                <Close />
              </RemoveImageButton>
            </ImagePreview>
          )}
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              sx={{
                borderRadius: "20px",
                background: "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
                color: "white",
                "&:hover": {
                  background: "linear-gradient(45deg, #1565c0 30%, #2196f3 90%)",
                },
              }}
            >
              {loading ? <CircularProgress size={24} /> : "저장"}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate("/mypage")}
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
          </Box>
        </Box>
      )}
    </Box>
  );
}