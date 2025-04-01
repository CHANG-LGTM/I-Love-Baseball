import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AdminPage/AuthContext";
import axios from "axios";
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
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Rating, // Rating 컴포넌트 추가
} from "@mui/material";
import RateReviewIcon from "@mui/icons-material/RateReview";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

interface Review {
  id: number;
  productName: string;
  rating: number;
  content: string;
  createdAt: string;
}

export default function MyPage() {
  const { nickname } = useAuth();
  const navigate = useNavigate();
  const [selectedMenu, setSelectedMenu] = useState<string>("overview");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!nickname) {
      navigate("/login");
    }
  }, [nickname, navigate]);

  // 리뷰 데이터를 가져오는 함수
  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      // const token = localStorage.getItem("jwt");
      // if (!token) {
      //   throw new Error("JWT 토큰이 없습니다. 로그인이 필요합니다.");
      // }
      const response = await axios.get<Review[]>(
        "http://localhost:8092/api/reviews/my-reviews",
        {
          // headers: {
          //   Authorization: `Bearer ${token}`,
          // },
          withCredentials: true,
        }
      );
      setReviews(response.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("로그인이 필요합니다.");
        navigate("/login");
      } else {
        setError("리뷰를 불러오는 데 실패했습니다.");
        console.error("리뷰 불러오기 실패:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  // 리뷰 메뉴가 선택될 때마다 리뷰 데이터를 새로 가져오도록 설정
  useEffect(() => {
    if (selectedMenu === "reviews" && reviews.length === 0) {
      fetchReviews();
    }
  }, [selectedMenu]);

  // 메뉴 항목 클릭 시 호출되는 핸들러
  const handleMenuClick = (menu: string, path: string) => {
    setSelectedMenu(menu);
    if (menu === "reviews") {
      fetchReviews(); // 리뷰 메뉴 클릭 시 항상 최신 데이터 가져오기
    } else {
      navigate(path);
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#ffffff", marginTop: 8 }}>
      {/* 왼쪽 사이드바 */}
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 240,
            boxSizing: "border-box",
            bgcolor: "#ffffff",
            borderRight: "1px solid #e0e0e0",
            marginTop: "64px",
            boxShadow: "2px 0 5px rgba(0,0,0,0.05)",
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1976d2" }}>
            마이페이지
          </Typography>
          <Typography variant="body2" sx={{ color: "#757575", mt: 0.5 }}>
            {nickname}님
          </Typography>
        </Box>
        <Divider />
        <List>
          <ListItem
            button
            selected={selectedMenu === "reviews"}
            onClick={() => handleMenuClick("reviews", "/my-page")}
            sx={{
              "&.Mui-selected": {
                bgcolor: "#e3f2fd",
                "&:hover": { bgcolor: "#bbdefb" },
              },
              "&:hover": { bgcolor: "#f5f5f5" },
              py: 1.5,
            }}
          >
            <ListItemIcon>
              <RateReviewIcon color={selectedMenu === "reviews" ? "primary" : "inherit"} />
            </ListItemIcon>
            <ListItemText primary="내가 작성한 리뷰 보기" />
          </ListItem>
          <ListItem
            button
            selected={selectedMenu === "shipping"}
            onClick={() => handleMenuClick("shipping", "/shipping")}
            sx={{
              "&.Mui-selected": {
                bgcolor: "#e3f2fd",
                "&:hover": { bgcolor: "#bbdefb" },
              },
              "&:hover": { bgcolor: "#f5f5f5" },
              py: 1.5,
            }}
          >
            <ListItemIcon>
              <LocalShippingIcon color={selectedMenu === "shipping" ? "primary" : "inherit"} />
            </ListItemIcon>
            <ListItemText primary="배송조회/현황" />
          </ListItem>
          <ListItem
            button
            selected={selectedMenu === "cart"}
            onClick={() => handleMenuClick("cart", "/cart")}
            sx={{
              "&.Mui-selected": {
                bgcolor: "#e3f2fd",
                "&:hover": { bgcolor: "#bbdefb" },
              },
              "&:hover": { bgcolor: "#f5f5f5" },
              py: 1.5,
            }}
          >
            <ListItemIcon>
              <ShoppingCartIcon color={selectedMenu === "cart" ? "primary" : "inherit"} />
            </ListItemIcon>
            <ListItemText primary="장바구니" />
          </ListItem>
        </List>
      </Drawer>

      {/* 메인 콘텐츠 */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
          bgcolor: "#ffffff",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 2,
            bgcolor: "#ffffff",
            minHeight: "80vh",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          {selectedMenu === "overview" && (
            <>
              <Typography variant="h4" sx={{ fontWeight: "bold", color: "#333" }}>
                마이페이지
              </Typography>
              <Typography variant="h6" sx={{ mt: 2, color: "#555" }}>
                환영합니다, {nickname}님!
              </Typography>
              <Button
                variant="contained"
                sx={{
                  mt: 3,
                  bgcolor: "#1976d2",
                  "&:hover": { bgcolor: "#1565c0" },
                  borderRadius: 1,
                  px: 3,
                  py: 1,
                }}
                onClick={() => {
                  setSelectedMenu("reviews");
                  fetchReviews();
                }}
              >
                내 리뷰 보기/작성하기
              </Button>
            </>
          )}

          {selectedMenu === "reviews" && (
            <>
              <Typography variant="h5" sx={{ fontWeight: "bold", color: "#333", mb: 3 }}>
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
                        <TableCell sx={{ fontWeight: "bold" }}>상품명</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>평점</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>리뷰 내용</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>작성일</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reviews.map((review) => (
                        <TableRow key={review.id}>
                          <TableCell>{review.productName}</TableCell>
                          <TableCell>
                            <Rating value={review.rating} readOnly size="small" />
                          </TableCell>
                          <TableCell>{review.content}</TableCell>
                          <TableCell>{new Date(review.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}
        </Paper>
      </Box>
    </Box>
  );
}