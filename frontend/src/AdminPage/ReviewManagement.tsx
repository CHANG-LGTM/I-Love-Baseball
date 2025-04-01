import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardHeader,
  CardContent,
  Avatar,
  TextField,
  IconButton,
  Divider,
  Fade,
  CircularProgress,
} from "@mui/material";
import { Delete, Send } from "@mui/icons-material";
import axios from "axios";
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
}

const BASE_IMAGE_URL = "http://localhost:8092/review_img/";

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

export default function ReviewManagement() {
  const { isAdmin } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState<boolean>(true);

  const getImageSrc = (image: string | undefined): string => {
    if (!image) {
      return "/path/to/fallback-image.jpg";
    }
    if (image.startsWith("data:image")) {
      return image;
    }
    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }
    const fileName = image.split("/").pop();
    const encodedFileName = encodeURIComponent(fileName || "");
    const imageUrl = `${BASE_IMAGE_URL}${encodedFileName}`;
    return imageUrl;
  };

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const response = await axios.get<Review[]>("http://localhost:8092/api/reviews", {
          withCredentials: true,
          headers: {
            Accept: "application/json", // 명시적으로 JSON 응답을 요청
          },
        });

        // 응답 데이터 디버깅
        console.log("API Response:", response.data);
        console.log("Type of response.data:", typeof response.data);
        console.log("Is response.data an array?", Array.isArray(response.data));
        console.log("Raw response.data (as string):", JSON.stringify(response.data));

        // 응답 데이터가 배열인지 확인
        let data: Review[] = [];
        if (Array.isArray(response.data)) {
          data = response.data;
        } else if (typeof response.data === "string") {
          // 문자열인 경우, 공백 및 줄바꿈 제거 후 파싱 시도
          const cleanedData = response.data.trim();
          console.log("Cleaned response.data:", cleanedData);
          try {
            data = JSON.parse(cleanedData);
            if (!Array.isArray(data)) {
              throw new Error("Parsed data is not an array");
            }
          } catch (parseError) {
            console.error("JSON 파싱 실패:", parseError);
            console.error("문제의 데이터:", cleanedData);
            setError("리뷰 데이터가 올바른 JSON 형식이 아닙니다.");
            setReviews([]);
            setLoading(false);
            return;
          }
        } else {
          setError("리뷰 데이터가 배열 형식이 아닙니다.");
          setReviews([]);
          setLoading(false);
          return;
        }

        // comments 필드 초기화
        const formattedReviews = data.map((review: Review) => ({
          ...review,
          comments: review.comments || [],
        }));
        setReviews(formattedReviews);
      } catch (err: any) {
        console.error("리뷰 가져오기 실패:", err);
        if (err.response) {
          setError(`리뷰를 불러오는 데 실패했습니다: ${err.response.status} - ${err.response.data.message || err.response.statusText}`);
        } else if (err.request) {
          setError("서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.");
        } else {
          setError("리뷰를 불러오는 중 알 수 없는 오류가 발생했습니다.");
        }
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const handleDelete = async (id: number) => {
    if (!isAdmin) {
      setError("관리자만 리뷰를 삭제할 수 있습니다.");
      return;
    }

    try {
      const response = await axios.delete(`http://localhost:8092/api/reviews/${id}`, {
        data: { nickname: "", isAdmin: true },
      });
      if (response.status === 403) {
        setError("관리자만 리뷰를 삭제할 수 있습니다.");
        return;
      }
      setReviews((prev) => prev.filter((r) => r.id !== id));
      setSuccess("리뷰가 성공적으로 삭제되었습니다.");
    } catch (err) {
      console.error("리뷰 삭제 실패:", err);
      setError("리뷰 삭제에 실패했습니다.");
    }
  };

  const handleAddComment = async (reviewId: number) => {
    if (!isAdmin) {
      setError("관리자만 댓글을 작성할 수 있습니다.");
      return;
    }

    const content = commentInputs[reviewId];
    if (!content || !content.trim()) {
      setError("댓글 내용을 입력해주세요.");
      return;
    }

    try {
      const response = await axios.post(`http://localhost:8092/api/reviews/${reviewId}/comments`, {
        content,
      });
      const newComment = response.data;
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, comments: [...(r.comments || []), newComment] } : r
        )
      );
      setCommentInputs((prev) => ({ ...prev, [reviewId]: "" }));
      setSuccess("댓글이 성공적으로 작성되었습니다.");
    } catch (err) {
      console.error("댓글 작성 실패:", err);
      setError("댓글 작성에 실패했습니다.");
    }
  };

  const handleCommentChange = (reviewId: number, value: string) => {
    setCommentInputs((prev) => ({ ...prev, [reviewId]: value }));
  };

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
    <Box sx={{ padding: 12, marginTop: 8, maxWidth: "900px", margin: "0 auto", backgroundColor: "#f5f5f5" }}>
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
        리뷰 관리
      </Typography>
      {error && (
        <Typography color="error" sx={{ mt: 2, textAlign: "center" }}>
          {error}
        </Typography>
      )}
      {success && (
        <Typography color="success.main" sx={{ mt: 2, textAlign: "center" }}>
          {success}
        </Typography>
      )}
      <Box sx={{ mt: 4 }}>
        {Array.isArray(reviews) && reviews.length === 0 ? (
          <Typography sx={{ textAlign: "center", color: "text.secondary" }}>
            아직 리뷰가 없습니다.
          </Typography>
        ) : !Array.isArray(reviews) ? (
          <Typography sx={{ textAlign: "center", color: "error" }}>
            리뷰 데이터를 불러올 수 없습니다.
          </Typography>
        ) : (
          reviews.map((r) => (
            <Fade in={true} timeout={500} key={r.id}>
              <StyledCard>
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: "#1976d2" }}>
                      {r.nickname.charAt(0)}
                    </Avatar>
                  }
                  title={
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#333" }}>
                      {r.nickname}
                    </Typography>
                  }
                  subheader={
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(r.createdAt), "yyyy년 MM월 dd일 HH:mm:ss")}
                    </Typography>
                  }
                  action={
                    <IconButton onClick={() => handleDelete(r.id)}>
                      <Delete sx={{ color: "#ef5350" }} />
                    </IconButton>
                  }
                />
                <CardContent>
                  <Typography sx={{ color: "#555", mb: 2 }}>{r.content}</Typography>
                  {r.imageUrl && (
                    <Box sx={{ mt: 2, mb: 2 }}>
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
                          (e.target as HTMLImageElement).src = "/path/to/fallback-image.jpg";
                        }}
                      />
                    </Box>
                  )}
                  <Divider sx={{ my: 2, borderColor: "rgba(0,0,0,0.1)" }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#1976d2", mb: 1 }}>
                    관리자 댓글
                  </Typography>
                  {r.comments && r.comments.length > 0 ? (
                    r.comments.map((comment) => (
                      <Box key={comment.id} sx={{ mb: 1, pl: 2, borderLeft: "2px solid #1976d2" }}>
                        <Typography variant="body2" sx={{ color: "#555" }}>
                          {comment.content}
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
                      value={commentInputs[r.id] || ""}
                      onChange={(e) => handleCommentChange(r.id, e.target.value)}
                      fullWidth
                      size="small"
                    />
                    <IconButton
                      onClick={() => handleAddComment(r.id)}
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
    </Box>
  );
}