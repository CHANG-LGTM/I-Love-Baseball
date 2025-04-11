import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AdminPage/AuthContext";
import axios, { AxiosError } from "axios";
import {
  Box,
  Typography,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  CircularProgress,
  Alert,
  Rating,
  Avatar,
  Card,
  CardContent,
  CardActions,
  AppBar,
  Toolbar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import RateReviewIcon from "@mui/icons-material/RateReview";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PersonIcon from "@mui/icons-material/Person";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { format } from "date-fns";

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

export default function MyPage() {
  const { nickname } = useAuth();
  const navigate = useNavigate();
  const [selectedMenu, setSelectedMenu] = useState<string>("overview");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);

  useEffect(() => {
    if (!nickname) {
      navigate("/login");
    }
  }, [nickname, navigate]);

  // 성공/에러 메시지 3초 후 사라짐
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<Review[]>(`${API_BASE_URL}/api/reviews/my-reviews`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      const formattedReviews = response.data.map((review) => ({
        ...review,
        comments: review.comments || [],
        imageUrl: review.imageUrl ? getImageSrc(review.imageUrl) : undefined,
      }));
      setReviews(formattedReviews);
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      if (axiosError.response?.status === 401) {
        setError("로그인이 필요합니다.");
        localStorage.removeItem("nickname");
        localStorage.removeItem("token");
        setTimeout(() => navigate("/login"), 1000);
      } else {
        setError(
          axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          "리뷰를 불러오는 데 실패했습니다. 나중에 다시 시도해주세요."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (selectedReviewId === null) return;

    setLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/api/reviews/${selectedReviewId}`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        data: { nickname, isAdmin: false },
      });
      setReviews((prev) => prev.filter((r) => r.id !== selectedReviewId));
      setSuccess("리뷰가 성공적으로 삭제되었습니다.");
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      setError(
        axiosError.response?.data?.message ||
        axiosError.message ||
        "리뷰 삭제에 실패했습니다."
      );
    } finally {
      setLoading(false);
      setOpenDeleteDialog(false);
      setSelectedReviewId(null);
    }
  };

  useEffect(() => {
    if (selectedMenu === "reviews" && reviews.length === 0) {
      fetchReviews();
    }
  }, [selectedMenu]);

  const handleMenuClick = (menu: string, path?: string) => {
    setSelectedMenu(menu);
    if (menu === "reviews") {
      fetchReviews();
    } else if (path) {
      navigate(path);
    }
  };

  const getImageSrc = (image: string | undefined): string => {
    if (!image) return FALLBACK_IMAGE;
    if (image.startsWith("data:image") || image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }
    const fileName = image.split("/").pop();
    if (!fileName) return FALLBACK_IMAGE;
    return `${REVIEW_IMAGE_BASE_URL}${encodeURIComponent(fileName)}`;
  };

  const drawerContent = (
    <Box>
      <Box sx={{ p: 2, bgcolor: "#ffffff" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar sx={{ bgcolor: "#1976d2" }}>
            <PersonIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1976d2" }}>
              마이페이지
            </Typography>
            <Typography variant="body2" sx={{ color: "#757575" }}>
              {nickname}님
            </Typography>
          </Box>
        </Box>
      </Box>
      <Divider />
      <List>
        <ListItem
          sx={{
            "&:hover": { bgcolor: "#f5f5f5" },
            ...(selectedMenu === "overview" && {
              bgcolor: "#e3f2fd",
              "&:hover": { bgcolor: "#bbdefb" },
            }),
            py: 1.5,
            cursor: "pointer",
          }}
          onClick={() => handleMenuClick("overview")}
        >
          <ListItemIcon>
            <PersonIcon color={selectedMenu === "overview" ? "primary" : "inherit"} />
          </ListItemIcon>
          <ListItemText primary="개요" />
        </ListItem>
        <ListItem
          sx={{
            "&:hover": { bgcolor: "#f5f5f5" },
            ...(selectedMenu === "reviews" && {
              bgcolor: "#e3f2fd",
              "&:hover": { bgcolor: "#bbdefb" },
            }),
            py: 1.5,
            cursor: "pointer",
          }}
          onClick={() => handleMenuClick("reviews")}
        >
          <ListItemIcon>
            <RateReviewIcon color={selectedMenu === "reviews" ? "primary" : "inherit"} />
          </ListItemIcon>
          <ListItemText primary="내가 작성한 리뷰 보기" />
        </ListItem>
        <ListItem
          sx={{
            "&:hover": { bgcolor: "#f5f5f5" },
            ...(selectedMenu === "shipping" && {
              bgcolor: "#e3f2fd",
              "&:hover": { bgcolor: "#bbdefb" },
            }),
            py: 1.5,
            cursor: "pointer",
          }}
          onClick={() => handleMenuClick("shipping", "/shipping")}
        >
          <ListItemIcon>
            <LocalShippingIcon color={selectedMenu === "shipping" ? "primary" : "inherit"} />
          </ListItemIcon>
          <ListItemText primary="배송조회/현황" />
        </ListItem>
        <ListItem
          sx={{
            "&:hover": { bgcolor: "#f5f5f5" },
            ...(selectedMenu === "cart" && {
              bgcolor: "#e3f2fd",
              "&:hover": { bgcolor: "#bbdefb" },
            }),
            py: 1.5,
            cursor: "pointer",
          }}
          onClick={() => handleMenuClick("cart", "/cart")}
        >
          <ListItemIcon>
            <ShoppingCartIcon color={selectedMenu === "cart" ? "primary" : "inherit"} />
          </ListItemIcon>
          <ListItemText primary="장바구니" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#ffffff", marginTop: 8 }}>
      {/* 모바일/태블릿 환경에서 상단 수평 메뉴 */}
      <AppBar
        position="fixed"
        sx={{
          display: { xs: "block", lg: "none" },
          top: 56,
          bgcolor: "#ffffff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          zIndex: 1100,
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            overflowX: "auto",
            whiteSpace: "nowrap",
            p: 0.5,
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          <Button
            onClick={() => handleMenuClick("overview")}
            sx={{
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
              px: { xs: 1.5, sm: 2 },
              py: 0.5,
              borderRadius: 1,
              color: "text.primary",
              bgcolor: "transparent",
              "&:hover": { bgcolor: "#f5f5f5" },
              minWidth: "auto",
              borderBottom: selectedMenu === "overview" ? "2px solid #666" : "none",
            }}
          >
            개요
          </Button>
          <Button
            onClick={() => handleMenuClick("reviews")}
            sx={{
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
              px: { xs: 1.5, sm: 2 },
              py: 0.5,
              borderRadius: 1,
              color: "text.primary",
              bgcolor: "transparent",
              "&:hover": { bgcolor: "#f5f5f5" },
              minWidth: "auto",
              borderBottom: selectedMenu === "reviews" ? "2px solid #666" : "none",
            }}
          >
            내 리뷰
          </Button>
          <Button
            onClick={() => handleMenuClick("shipping", "/shipping")}
            sx={{
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
              px: { xs: 1.5, sm: 2 },
              py: 0.5,
              borderRadius: 1,
              color: "text.primary",
              bgcolor: "transparent",
              "&:hover": { bgcolor: "#f5f5f5" },
              minWidth: "auto",
              borderBottom: selectedMenu === "shipping" ? "2px solid #666" : "none",
            }}
          >
            배송조회
          </Button>
          <Button
            onClick={() => handleMenuClick("cart", "/cart")}
            sx={{
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
              px: { xs: 1.5, sm: 2 },
              py: 0.5,
              borderRadius: 1,
              color: "text.primary",
              bgcolor: "transparent",
              "&:hover": { bgcolor: "#f5f5f5" },
              minWidth: "auto",
              borderBottom: selectedMenu === "cart" ? "2px solid #666" : "none",
            }}
          >
            장바구니
          </Button>
        </Toolbar>
      </AppBar>

      {/* 데스크톱 환경에서 고정 Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", lg: "block" },
          width: 240,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 240,
            boxSizing: "border-box",
            bgcolor: "#ffffff",
            marginTop: "64px",
            boxShadow: "2px 0 5px rgba(0,0,0,0.05)",
            borderRight: "1px solid #e0e0e0",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* 메인 콘텐츠 */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          bgcolor: "#ffffff",
          mt: { xs: 8, lg: 0 },
        }}
      >
        {selectedMenu === "overview" && (
          <>
            <Paper
              elevation={3}
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: 2,
                bgcolor: "#ffffff",
                mb: 3,
                display: "flex",
                alignItems: "center",
                gap: 2,
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              }}
            >
              <Avatar sx={{ bgcolor: "#1976d2", width: 48, height: 48 }}>
                <PersonIcon />
              </Avatar>
              <Box>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: "bold", color: "#333", fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
                >
                  {nickname}님, 안녕하세요!
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: "#555", mt: 0.5, fontSize: { xs: "0.875rem", sm: "1rem" } }}
                >
                  야구 용품 전문 쇼핑몰에 오신 것을 환영합니다.
                </Typography>
              </Box>
            </Paper>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }, gap: 2 }}>
              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  transition: "transform 0.2s ease-in-out",
                  "&:hover": { transform: "translateY(-4px)" },
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: "bold", color: "#333", fontSize: { xs: "1rem", sm: "1.125rem" } }}
                  >
                    내 리뷰
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#757575", mt: 1, fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                  >
                    작성한 리뷰를 확인하고 새로운 리뷰를 작성하세요.
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: { xs: 1, sm: 2 }, pt: 0 }}>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => {
                      setSelectedMenu("reviews");
                      fetchReviews();
                    }}
                    sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                  >
                    리뷰 보기
                  </Button>
                </CardActions>
              </Card>

              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  transition: "transform 0.2s ease-in-out",
                  "&:hover": { transform: "translateY(-4px)" },
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: "bold", color: "#333", fontSize: { xs: "1rem", sm: "1.125rem" } }}
                  >
                    배송 조회
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#757575", mt: 1, fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                  >
                    주문한 상품의 배송 상태를 확인하세요.
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: { xs: 1, sm: 2 }, pt: 0 }}>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => handleMenuClick("shipping", "/shipping")}
                    sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                  >
                    배송 조회
                  </Button>
                </CardActions>
              </Card>

              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  transition: "transform 0.2s ease-in-out",
                  "&:hover": { transform: "translateY(-4px)" },
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: "bold", color: "#333", fontSize: { xs: "1rem", sm: "1.125rem" } }}
                  >
                    장바구니
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#757575", mt: 1, fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                  >
                    장바구니에 담긴 상품을 확인하고 구매를 진행하세요.
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: { xs: 1, sm: 2 }, pt: 0 }}>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => handleMenuClick("cart", "/cart")}
                    sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                  >
                    장바구니 보기
                  </Button>
                </CardActions>
              </Card>
            </Box>
          </>
        )}

        {selectedMenu === "reviews" && (
          <Paper
            elevation={3}
            sx={{
              p: { xs: 2, sm: 4 },
              borderRadius: 2,
              bgcolor: "#ffffff",
              minHeight: "80vh",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
          >
            <Typography
              variant="h5"
              sx={{ fontWeight: "bold", color: "#333", mb: 3, fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
            >
              내가 작성한 리뷰
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
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <CircularProgress />
              </Box>
            ) : reviews.length === 0 ? (
              <Typography variant="body1" sx={{ color: "#757575", mt: 2 }}>
                작성한 리뷰가 없습니다.
              </Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {reviews.map((review) => (
                  <Card key={review.id} sx={{ borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                    <CardContent>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333" }}>
                          {review.productName}
                        </Typography>
                        <Box>
                          <IconButton onClick={() => navigate(`/edit-review/${review.id}`)}>
                            <EditIcon sx={{ color: "#1976d2" }} />
                          </IconButton>
                          <IconButton onClick={() => {
                            setSelectedReviewId(review.id);
                            setOpenDeleteDialog(true);
                          }}>
                            <DeleteIcon sx={{ color: "#ef5350" }} />
                          </IconButton>
                        </Box>
                      </Box>
                      <Rating value={review.rating} readOnly size="small" sx={{ mb: 1 }} />
                      <Typography variant="body1" sx={{ color: "#555", mb: 2 }}>
                        {review.content}
                      </Typography>
                      {review.imageUrl && (
                        <Box sx={{ mt: 2, mb: 2 }}>
                          <img
                            src={review.imageUrl}
                            alt="리뷰 이미지"
                            style={{
                              maxWidth: "100%",
                              maxHeight: "200px",
                              borderRadius: "8px",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                            }}
                          />
                        </Box>
                      )}
                      <Typography variant="caption" color="text.secondary">
                        작성일: {format(new Date(review.createdAt), "yyyy년 MM월 dd일 HH:mm:ss")}
                      </Typography>
                      {/* 관리자 댓글 표시 */}
                      <Divider sx={{ my: 2, borderColor: "rgba(0,0,0,0.1)" }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#1976d2", mb: 1 }}>
                        관리자 답변
                      </Typography>
                      {review.comments && review.comments.length > 0 ? (
                        review.comments.map((comment) => (
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
                          아직 관리자 답변이 없습니다.
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Paper>
        )}

        {/* 삭제 확인 다이얼로그 */}
        <Dialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
        >
          <DialogTitle id="delete-dialog-title">리뷰 삭제 확인</DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-dialog-description">
              정말로 이 리뷰를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
              취소
            </Button>
            <Button onClick={handleDelete} color="error" autoFocus>
              삭제
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}