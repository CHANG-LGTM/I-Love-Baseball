import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SportsBaseballIcon from "@mui/icons-material/SportsBaseball";
import SportsHandballIcon from "@mui/icons-material/SportsHandball";
import SportsMmaIcon from "@mui/icons-material/SportsMma";
import InventoryIcon from "@mui/icons-material/Inventory";
import RateReviewIcon from "@mui/icons-material/RateReview"; // 리뷰 아이콘
import PersonIcon from "@mui/icons-material/Person"; // 마이페이지 아이콘
import LocalShippingIcon from "@mui/icons-material/LocalShipping"; // 배송 아이콘
import {
  AppBar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AdminPage/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { nickname, setNickname, isAdmin, setIsAdmin, loading } = useAuth(); // checkAuth 제거, loading 추가
  const [open, setOpen] = useState(false);

  // useEffect에서 checkAuth 호출 제거
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!nickname) {
      setOpen(false);
    }
  }, [nickname]);

  const handleOpenDialog = () => {
    if (nickname) {
      setOpen(true);
    }
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:8092/api/auth/logout", {}, { withCredentials: true });
      console.log("로그아웃 성공");
    } catch (err) {
      console.error("로그아웃 실패:", err);
    }

    localStorage.removeItem("token");
    localStorage.removeItem("nickname");
    setNickname(null);
    setIsAdmin(false);
    setOpen(false);
    navigate("/");
  };

  // AuthProvider의 loading 상태 활용
  if (loading) {
    return (
      <AppBar position="fixed" color="primary">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            <Link to="/" style={{ textDecoration: "none", color: "white" }}>
              ⚾ 야구 용품점
            </Link>
          </Typography>
          <Typography>로딩 중...</Typography>
        </Toolbar>
      </AppBar>
    );
  }

  return (
    <AppBar position="fixed" color="primary">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          <Link to="/" style={{ textDecoration: "none", color: "white" }}>
            ⚾ 야구 용품점
          </Link>
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center" }}>
          {nickname ? (
            <>
              <Typography variant="body1" sx={{ marginRight: 2, color: "white" }}>
                {nickname}님 환영합니다!
              </Typography>
              {isAdmin ? (
                <>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/admin/products"
                    startIcon={<InventoryIcon />}
                  >
                    상품 관리
                  </Button>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/admin/reviews"
                    startIcon={<RateReviewIcon />}
                  >
                    리뷰 관리
                  </Button>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/admin/shipping"
                    startIcon={<LocalShippingIcon />}
                  >
                    배송 관리
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/mypage"
                    startIcon={<PersonIcon />}
                  >
                    마이페이지
                  </Button>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/review-list"
                    startIcon={<RateReviewIcon />}
                  >
                    구매후기
                  </Button>
                </>
              )}
              <IconButton color="inherit" component={Link} to="/cart" sx={{ marginLeft: 2 }}>
                <ShoppingCartIcon />
              </IconButton>
              <Button color="inherit" component={Link} to="/bats" startIcon={<SportsBaseballIcon />}>
                야구배트
              </Button>
              <Button
                color="inherit"
                component={Link}
                to="/batting-gloves"
                startIcon={<SportsMmaIcon />}
              >
                배팅장갑
              </Button>
              <Button
                color="inherit"
                component={Link}
                to="/protection"
                startIcon={<HealthAndSafetyIcon />}
              >
                보호장비
              </Button>
              <Button
                color="inherit"
                component={Link}
                to="/gloves"
                startIcon={<SportsHandballIcon />}
              >
                글러브
              </Button>
              <Button
                color="inherit"
                component={Link}
                to="/shoes"
                startIcon={<SportsHandballIcon />}
              >
                야구화
              </Button>
              <Button color="inherit" onClick={handleOpenDialog}>
                로그아웃
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">
                로그인
              </Button>
              <Button color="inherit" component={Link} to="/register">
                회원가입
              </Button>
              <IconButton color="inherit" component={Link} to="/cart" sx={{ marginLeft: 2 }}>
                <ShoppingCartIcon />
              </IconButton>
              <Button color="inherit" component={Link} to="/bats" startIcon={<SportsBaseballIcon />}>
                야구배트
              </Button>
              <Button
                color="inherit"
                component={Link}
                to="/batting-gloves"
                startIcon={<SportsMmaIcon />}
              >
                배팅장갑
              </Button>
              <Button
                color="inherit"
                component={Link}
                to="/protection"
                startIcon={<HealthAndSafetyIcon />}
              >
                보호장비
              </Button>
              <Button
                color="inherit"
                component={Link}
                to="/gloves"
                startIcon={<SportsHandballIcon />}
              >
                글러브
              </Button>
              <Button
                color="inherit"
                component={Link}
                to="/shoes"
                startIcon={<SportsHandballIcon />}
              >
                야구화
              </Button>
            </>
          )}
        </Box>

        <Dialog
          open={open}
          onClose={handleCloseDialog}
          aria-labelledby="logout-dialog-title"
          aria-describedby="logout-dialog-description"
        >
          <DialogTitle id="logout-dialog-title">로그아웃 확인</DialogTitle>
          <DialogContent>
            <DialogContentText id="logout-dialog-description">
              로그아웃 하시겠습니까?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">
              취소
            </Button>
            <Button onClick={handleLogout} color="primary" autoFocus>
              확인
            </Button>
          </DialogActions>
        </Dialog>
      </Toolbar>
    </AppBar>
  );
}