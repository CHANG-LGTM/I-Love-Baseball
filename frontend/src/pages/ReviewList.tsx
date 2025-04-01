import { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
  Fade,
  Rating, // 별점 컴포넌트 추가
} from "@mui/material";
import { Edit, Delete, CameraAlt, Close } from "@mui/icons-material";
import axios from "axios";
import { useAuth } from "../AdminPage/AuthContext";
import { styled } from "@mui/material/styles";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const BASE_IMAGE_URL = "http://localhost:8092/review_img/";

interface Review {
  id: number;
  nickname: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  comments?: ReviewComment[];
  rating: number; // 별점 필드 추가
}

interface ReviewComment {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: "16px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  transition: "transform 0.3s, box-shadow 0.3s",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
  },
  backgroundColor: "#fff",
}));

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

export default function ReviewList() {
  const { nickname } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState<string>("");
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const getImageSrc = (image: string | undefined): string => {
    if (!image) {
      return "/path/to/fallback-image.jpg";
    }
    console.log("review.imageUrl:", image);
    if (
      image.startsWith("data:image") ||
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }
    const fileName = image.split("/").pop();
    if (!fileName) {
      return "/path/to/fallback-image.jpg";
    }
    const encodedFileName = encodeURIComponent(fileName);
    const imageUrl = `${BASE_IMAGE_URL}${encodedFileName}`;
    console.log("Generated image URL:", imageUrl);
    return imageUrl;
  };

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get<Review[]>(
        "http://localhost:8092/api/reviews",
        {
          withCredentials: true,
          headers: {
            Accept: "application/json",
          },
        }
      );

      let data: Review[] = [];
      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (typeof response.data === "string") {
        const cleanedData = response.data.trim();
        console.log("Cleaned response.data:", cleanedData);
        try {
          data = JSON.parse(cleanedData);
          if (!Array.isArray(data)) {
            throw new Error("Parsed data is not an array");
          }
        } catch (parseError) {
          setError("리뷰 데이터가 올바른 JSON 형식이 아닙니다.");
          setReviews([]);
          setIsLoading(false);
          return;
        }
      } else {
        setError("리뷰 데이터가 배열 형식이 아닙니다.");
        setReviews([]);
        setIsLoading(false);
        return;
      }

      const formattedReviews = data.map((review: Review) => ({
        ...review,
        comments: review.comments || [],
        rating: review.rating || 0, // 별점이 없을 경우 기본값 0 설정
      }));
      setReviews(formattedReviews);
    } catch (err: any) {
      if (err.response) {
        setError(
          `리뷰를 불러오는 데 실패했습니다: ${err.response.status} - ${
            err.response.data.message || err.response.statusText
          }`
        );
      } else if (err.request) {
        setError(
          "서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요."
        );
      } else {
        setError("리뷰를 불러오는 중 알 수 없는 오류가 발생했습니다.");
      }
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("페이지 렌더링 - useEffect, nickname:", nickname);
    if (isLoading) return;
    fetchReviews();
  }, [nickname]);

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setError("이미지 크기는 5MB를 초과할 수 없습니다.");
        return;
      }
      setEditImage(file);
      setEditImagePreview(URL.createObjectURL(file));
    }
  };

  const removeEditImage = () => {
    setEditImage(null);
    setEditImagePreview(null);
    if (editFileInputRef.current) {
      editFileInputRef.current.value = "";
    }
  };

  const handleEdit = (review: Review) => {
    setEditingReviewId(review.id);
    setEditContent(review.content);
    if (review.imageUrl) {
      setEditImagePreview(getImageSrc(review.imageUrl));
    }
  };

  const handleUpdate = async (id: number) => {
    if (!nickname) {
      setError("로그인이 필요합니다.");
      return;
    }
    if (!editContent.trim()) {
      setError("리뷰 내용을 입력해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("nickname", nickname);
      formData.append("content", editContent);
      if (editImage) {
        formData.append("image", editImage);
      }

      const response = await axios.put(
        `http://localhost:8092/api/reviews/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      if (response.status === 403) {
        setError("본인이 작성한 리뷰만 수정할 수 있습니다.");
        return;
      }

      setReviews((prev) => prev.map((r) => (r.id === id ? response.data : r)));
      setEditingReviewId(null);
      setEditContent("");
      setEditImage(null);
      setEditImagePreview(null);
      setError(null);
      setSuccess("리뷰가 성공적으로 수정되었습니다.");
    } catch (err) {
      console.error("리뷰 수정 실패:", err);
      setError("리뷰 수정에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!nickname) {
      setError("로그인이 필요합니다.");
      return;
    }
    if (!window.confirm("정말로 이 리뷰를 삭제하시겠습니까?")) return;

    setIsLoading(true);
    try {
      await axios.delete(`http://localhost:8092/api/reviews/${id}`, {
        data: { nickname, isAdmin: false },
        withCredentials: true,
      });
      setReviews((prev) => prev.filter((r) => r.id !== id));
      setSuccess("리뷰가 성공적으로 삭제되었습니다.");
    } catch (err) {
      console.error("리뷰 삭제 실패:", err);
      setError("리뷰 삭제에 실패했습니다.");
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
        📜 리뷰 목록
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
        <Button
          variant="contained"
          onClick={() => navigate("/write-review")}
          sx={{
            borderRadius: "20px",
            background: "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
            color: "white",
            px: 4,
            "&:hover": {
              background: "linear-gradient(45deg, #1565c0 30%, #2196f3 90%)",
            },
          }}
        >
          구매후기 작성하기
        </Button>
      </Box>

      <Divider sx={{ my: 4, borderColor: "rgba(0,0,0,0.1)" }} />

      <Typography
        variant="h5"
        sx={{ mb: 3, fontWeight: "medium", color: "#333" }}
      >
        구매후기 목록
      </Typography>

      {isLoading && reviews.length === 0 ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : reviews.length === 0 ? (
        <Fade in={true} timeout={1000}>
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              아직 등록된 리뷰가 없습니다. 첫 번째 리뷰를 작성해보세요!
            </Typography>
          </Box>
        </Fade>
      ) : (
        <Grid container spacing={3}>
          {reviews.map((r) => (
            <Grid item xs={12} key={r.id}>
              <Fade in={true} timeout={500}>
                <StyledCard>
                  {editingReviewId === r.id ? (
                    <CardContent sx={{ position: "relative" }}>
                      <StyledTextField
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        fullWidth
                        multiline
                        rows={3}
                        sx={{ mb: 2 }}
                      />

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mb: 2,
                        }}
                      >
                        <Button
                          variant="outlined"
                          component="label"
                          startIcon={<CameraAlt />}
                          size="small"
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
                          사진 변경
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={handleEditImageChange}
                            ref={editFileInputRef}
                          />
                        </Button>
                      </Box>

                      {editImagePreview && (
                        <ImagePreview>
                          <img
                            src={editImagePreview}
                            alt="미리보기"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "/path/to/fallback-image.jpg";
                            }}
                          />
                          <RemoveImageButton
                            size="small"
                            onClick={removeEditImage}
                          >
                            <Close />
                          </RemoveImageButton>
                        </ImagePreview>
                      )}

                      <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                        <Button
                          variant="contained"
                          onClick={() => handleUpdate(r.id)}
                          disabled={isLoading}
                          size="small"
                          sx={{
                            borderRadius: "20px",
                            background:
                              "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
                            color: "white",
                            "&:hover": {
                              background:
                                "linear-gradient(45deg, #1565c0 30%, #2196f3 90%)",
                            },
                          }}
                        >
                          {isLoading ? <CircularProgress size={20} /> : "저장"}
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setEditingReviewId(null);
                            setEditImagePreview(
                              r.imageUrl ? getImageSrc(r.imageUrl) : null
                            );
                          }}
                          size="small"
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
                      <IconButton
                        sx={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          backgroundColor: "grey.200",
                          "&:hover": { backgroundColor: "grey.300" },
                        }}
                        onClick={() => {
                          setEditingReviewId(null);
                          setEditImagePreview(
                            r.imageUrl ? getImageSrc(r.imageUrl) : null
                          );
                        }}
                      >
                        <Close />
                      </IconButton>
                    </CardContent>
                  ) : (
                    <>
                      <CardHeader
                        avatar={
                          <Avatar sx={{ bgcolor: "#1976d2" }}>
                            {r.nickname.charAt(0)}
                          </Avatar>
                        }
                        title={
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: "bold", color: "#333" }}
                          >
                            {r.nickname}
                          </Typography>
                        }
                        subheader={
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              {format(
                                new Date(r.createdAt),
                                "yyyy년 MM월 dd일 HH:mm:ss"
                              )}
                            </Typography>
                            <Rating
                              name={`rating-${r.id}`}
                              value={r.rating}
                              readOnly
                              precision={1}
                              size="small"
                              sx={{ mt: 1 }}
                            />
                          </Box>
                        }
                        action={
                          r.nickname === nickname && (
                            <Box>
                              <IconButton onClick={() => handleEdit(r)}>
                                <Edit
                                  fontSize="small"
                                  sx={{ color: "#1976d2" }}
                                />
                              </IconButton>
                              <IconButton onClick={() => handleDelete(r.id)}>
                                <Delete
                                  fontSize="small"
                                  sx={{ color: "#ef5350" }}
                                />
                              </IconButton>
                            </Box>
                          )
                        }
                      />
                      <CardContent>
                        <Typography
                          variant="body1"
                          paragraph
                          sx={{ color: "#555" }}
                        >
                          {r.content}
                        </Typography>
                        {r.imageUrl && (
                          <Box sx={{ mt: 2 }}>
                            <img
                              src={getImageSrc(r.imageUrl)}
                              alt="리뷰 이미지"
                              style={{
                                maxWidth: "100%",
                                maxHeight: "300px",
                                borderRadius: "12px",
                                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                              }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "/path/to/fallback-image.jpg";
                              }}
                            />
                          </Box>
                        )}
                      </CardContent>
                    </>
                  )}
                </StyledCard>
              </Fade>
            </Grid>
          ))}
        </Grid>
      )}

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