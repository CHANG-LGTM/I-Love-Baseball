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
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Alert,
  Rating,
  Avatar,
  Card,
  CardContent,
  CardActions,
  AppBar,
  Toolbar,
} from "@mui/material";
import RateReviewIcon from "@mui/icons-material/RateReview";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PersonIcon from "@mui/icons-material/Person";

interface Review {
  id: number;
  productName: string;
  rating: number;
  content: string;
  createdAt: string;
}

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL || "http://localhost:8092";

export default function MyPage() {
  const { nickname } = useAuth();
  const navigate = useNavigate();
  const [selectedMenu, setSelectedMenu] = useState<string>("overview");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!nickname) {
      navigate("/login");
    }
  }, [nickname, navigate]);

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
      setReviews(response.data);
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
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            ) : reviews.length === 0 ? (
              <Typography variant="body1" sx={{ color: "#757575", mt: 2 }}>
                작성한 리뷰가 없습니다.
              </Typography>
            ) : (
              <TableContainer component={Paper} sx={{ mt: 2, borderRadius: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                        상품명
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                        평점
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                        리뷰 내용
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                        작성일
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reviews.map((review) => (
                      <TableRow key={review.id}>
                        <TableCell sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                          {review.productName}
                        </TableCell>
                        <TableCell>
                          <Rating value={review.rating} readOnly size="small" />
                        </TableCell>
                        <TableCell sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                          {review.content}
                        </TableCell>
                        <TableCell sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                          {new Date(review.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        )}
      </Box>
    </Box>
  );
}