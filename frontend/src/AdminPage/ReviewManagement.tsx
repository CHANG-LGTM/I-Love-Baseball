import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardHeader,
  CardContent,
  Avatar,
  TextField,
  IconButton,
  Divider,
  Fade,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import { Delete, Send } from "@mui/icons-material";
import axios, { AxiosError } from "axios";
import { useAuth } from "../AdminPage/AuthContext";
import { format } from "date-fns";
import { styled } from "@mui/material/styles";

interface Review {
  id: number;
  nickname: string;
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
const BASE_IMAGE_URL = `${API_BASE_URL}/review_img/`;

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: "12px",
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
    borderRadius: "20px",
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

const safeParseReviews = (data: unknown): Review[] => {
  if (Array.isArray(data) && data.every(item => 
    typeof item?.id === 'number' && 
    typeof item?.nickname === 'string'
  )) {
    return data;
  }

  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      return safeParseReviews(parsed);
    } catch {
      return [];
    }
  }

  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return [data as Review];
  }

  return [];
};

export default function ReviewManagement() {
  const { isAdmin, checkAuth } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);

  const getImageSrc = (image: string | undefined): string => {
    if (!image) return "/path/to/fallback-image.jpg";
    if (image.startsWith("data:image")) return image;
    if (image.startsWith("http://") || image.startsWith("https://")) return image;
    
    const fileName = image.split("/").pop() || "";
    const encodedFileName = encodeURIComponent(fileName);
    return `${BASE_IMAGE_URL}${encodedFileName}`;
  };

  // 성공 메시지가 표시된 후 3초 뒤에 사라지도록 설정
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 3000); // 3초 후 메시지 제거

      return () => clearTimeout(timer); // 컴포넌트 언마운트 시 타이머 정리
    }
  }, [success]);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated || !isAdmin) {
        setError("인증되지 않은 사용자입니다. 로그인 페이지로 이동합니다.");
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/reviews`, {
        withCredentials: true,
        headers: { Accept: "application/json" },
      });

      const parsedReviews = safeParseReviews(response.data);
      setReviews(parsedReviews.map(review => ({
        ...review,
        comments: review.comments || []
      })));
    } catch (err: unknown) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      if (axiosError.response?.status === 401) {
        setError("인증되지 않은 사용자입니다. 로그인 페이지로 이동합니다.");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(
          axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          "리뷰를 불러오는 데 실패했습니다."
        );
        setReviews([]);
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, checkAuth, isAdmin]);

  const handleDeleteConfirm = useCallback(async () => {
    if (selectedReviewId === null) return;

    try {
      const response = await axios.delete(`${API_BASE_URL}/api/reviews/${selectedReviewId}`, {
        withCredentials: true,
      });
      
      if (response.status === 403) {
        setError("본인이 작성한 리뷰이거나 관리자만 삭제할 수 있습니다.");
        return;
      }
      
      setReviews(prev => prev.filter(r => r.id !== selectedReviewId));
      setSuccess("리뷰가 성공적으로 삭제되었습니다.");
    } catch (err: unknown) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      if (axiosError.response?.status === 401) {
        setError("인증되지 않은 사용자입니다. 로그인 페이지로 이동합니다.");
        setTimeout(() => navigate("/login"), 2000);
      } else if (axiosError.response?.status === 403) {
        setError("본인이 작성한 리뷰이거나 관리자만 삭제할 수 있습니다.");
      } else {
        setError(
          axiosError.response?.data?.message ||
          "리뷰 삭제에 실패했습니다."
        );
      }
    } finally {
      setOpenDialog(false);
      setSelectedReviewId(null);
    }
  }, [selectedReviewId, navigate]);

  const handleDelete = useCallback((id: number) => {
    if (!isAdmin) {
      setError("관리자만 리뷰를 삭제할 수 있습니다.");
      return;
    }

    setSelectedReviewId(id);
    setOpenDialog(true);
  }, [isAdmin]);

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedReviewId(null);
  };

  const handleAddComment = useCallback(async (reviewId: number) => {
    if (!isAdmin) {
      setError("관리자만 댓글을 작성할 수 있습니다.");
      return;
    }

    const content = commentInputs[reviewId];
    if (!content?.trim()) {
      setError("댓글 내용을 입력해주세요.");
      return;
    }

    try {
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated || !isAdmin) {
        setError("인증되지 않은 사용자입니다. 로그인 페이지로 이동합니다.");
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      const response = await axios.post<ReviewComment>(
        `${API_BASE_URL}/api/reviews/${reviewId}/comments`,
        { content: content.trim() },
        { withCredentials: true }
      );
      
      setReviews(prev =>
        prev.map(r =>
          r.id === reviewId 
            ? { ...r, comments: [...(r.comments || []), response.data] } 
            : r
        )
      );
      setCommentInputs(prev => ({ ...prev, [reviewId]: "" }));
      setSuccess("댓글이 성공적으로 작성되었습니다.");
    } catch (err: unknown) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      if (axiosError.response?.status === 401) {
        setError("인증되지 않은 사용자입니다. 로그인 페이지로 이동합니다.");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(
          axiosError.response?.data?.message ||
          "댓글 작성에 실패했습니다."
        );
      }
    }
  }, [commentInputs, isAdmin, navigate, checkAuth]);

  const handleCommentChange = (reviewId: number, value: string) => {
    setCommentInputs(prev => ({ ...prev, [reviewId]: value }));
  };

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  if (loading) {
    return (
      <Box sx={{ padding: 4, marginTop: 8, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
          리뷰를 불러오는 중입니다...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      padding: 4, 
      marginTop: 8, 
      maxWidth: "900px", 
      margin: "0 auto", 
      backgroundColor: "#f5f5f5" 
    }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: "bold",
          mb: 5,
          mt: 8,
          color: "#1976d2",
          textAlign: "center",
          textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
        }}
      >
        리뷰 관리
      </Typography>
      
      {error && (
        <Fade in={true} timeout={500}>
          <Typography color="error" sx={{ mt: 2, textAlign: "center" }}>
            {error}
          </Typography>
        </Fade>
      )}
      
      {success && (
        <Fade in={true} timeout={500}>
          <Typography color="success.main" sx={{ mt: 2, textAlign: "center" }}>
            {success}
          </Typography>
        </Fade>
      )}
      
      <Box sx={{ mt: 4 }}>
        {reviews.length === 0 ? (
          <Typography sx={{ textAlign: "center", color: "text.secondary" }}>
            아직 리뷰가 없습니다.
          </Typography>
        ) : (
          reviews.map(review => (
            <Fade in={true} timeout={500} key={review.id}>
              <StyledCard>
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: "#1976d2" }}>
                      {review.nickname.charAt(0)}
                    </Avatar>
                  }
                  title={
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#333" }}>
                      {review.nickname}
                    </Typography>
                  }
                  subheader={
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(review.createdAt), "yyyy년 MM월 dd일 HH:mm:ss")}
                    </Typography>
                  }
                  action={
                    <IconButton onClick={() => handleDelete(review.id)}>
                      <Delete sx={{ color: "#ef5350" }} />
                    </IconButton>
                  }
                />
                <CardContent>
                  <Typography sx={{ color: "#555", mb: 2 }}>{review.content}</Typography>
                  {review.imageUrl && (
                    <Box sx={{ mt: 2, mb: 2 }}>
                      <img
                        src={getImageSrc(review.imageUrl)}
                        alt="리뷰 이미지"
                        style={{
                          maxWidth: "100%",
                          maxHeight: "300px",
                          borderRadius: "12px",
                          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/path/to/fallback-image.jpg";
                        }}
                      />
                    </Box>
                  )}
                  <Divider sx={{ my: 2, borderColor: "rgba(0,0,0,0.1)" }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#1976d2", mb: 1 }}>
                    관리자 댓글
                  </Typography>
                  {review.comments && review.comments.length > 0 ? (
                    review.comments.map(comment => (
                      <Box key={comment.id} sx={{ mb: 1, pl: 2, borderLeft: "2px solid #1976d2" }}>
                        <Typography variant="body2" sx={{ color: "#555" }}>
                          <strong>{comment.nickname}:</strong> {comment.content}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date(comment.createdAt), "yyyy년 MM월 dd일 HH:mm:ss")}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      아직 댓글이 없습니다.
                    </Typography>
                  )}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>
                    <StyledTextField
                      label="댓글 작성"
                      value={commentInputs[review.id] || ""}
                      onChange={(e) => handleCommentChange(review.id, e.target.value)}
                      fullWidth
                      size="small"
                    />
                    <IconButton
                      onClick={() => handleAddComment(review.id)}
                      sx={{ color: "#1976d2" }}
                    >
                      <Send />
                    </IconButton>
                  </Box>
                </CardContent>
              </StyledCard>
            </Fade>
          ))
        )}
      </Box>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"리뷰 삭제 확인"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            정말로 이 리뷰를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            취소
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}