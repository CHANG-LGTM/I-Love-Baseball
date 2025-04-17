import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SportsBaseballIcon from "@mui/icons-material/SportsBaseball";
import SportsHandballIcon from "@mui/icons-material/SportsHandball";
import SportsMmaIcon from "@mui/icons-material/SportsMma";
import InventoryIcon from "@mui/icons-material/Inventory";
import RateReviewIcon from "@mui/icons-material/RateReview";
import PersonIcon from "@mui/icons-material/Person";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import MenuIcon from "@mui/icons-material/Menu";
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
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import axios from "axios";
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AdminPage/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { nickname, setNickname, isAdmin, setIsAdmin, loading } = useAuth();
  const [openDialog, setOpenDialog] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // 환경 변수에서 API URL 가져오기
  const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL || "https://localhost:8092";

  useEffect(() => {
    setOpenDialog(false);
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!nickname) {
      setOpenDialog(false);
    }
  }, [nickname]);

  const handleOpenDialog = () => {
    if (nickname) {
      setOpenDialog(true);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
      console.log("로그아웃 성공");
    } catch (err) {
      console.error("로그아웃 실패:", err);
    }

    localStorage.removeItem("token");
    localStorage.removeItem("nickname");
    setNickname(null);
    setIsAdmin(false);
    setOpenDialog(false);
    navigate("/");
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = nickname
    ? isAdmin
      ? [
          { text: "상품 관리", icon: <InventoryIcon />, path: "/admin/products" },
          { text: "리뷰 관리", icon: <RateReviewIcon />, path: "/admin/reviews" },
          { text: "배송 관리", icon: <LocalShippingIcon />, path: "/admin/shipping" },
          { text: "야구배트", icon: <SportsBaseballIcon />, path: "/bats" },
          { text: "배팅장갑", icon: <SportsMmaIcon />, path: "/batting-gloves" },
          { text: "보호장비", icon: <HealthAndSafetyIcon />, path: "/protection" },
          { text: "글러브", icon: <SportsHandballIcon />, path: "/gloves" },
          { text: "야구화", icon: <SportsHandballIcon />, path: "/shoes" },
          { text: "장바구니", icon: <ShoppingCartIcon />, path: "/cart" },
        ]
      : [
          { text: "마이페이지", icon: <PersonIcon />, path: "/mypage" },
          { text: "구매후기", icon: <RateReviewIcon />, path: "/review-list" },
          { text: "야구배트", icon: <SportsBaseballIcon />, path: "/bats" },
          { text: "배팅장갑", icon: <SportsMmaIcon />, path: "/batting-gloves" },
          { text: "보호장비", icon: <HealthAndSafetyIcon />, path: "/protection" },
          { text: "글러브", icon: <SportsHandballIcon />, path: "/gloves" },
          { text: "야구화", icon: <SportsHandballIcon />, path: "/shoes" },
          { text: "장바구니", icon: <ShoppingCartIcon />, path: "/cart" },
        ]
    : [
        { text: "로그인", icon: null, path: "/login" },
        { text: "회원가입", icon: null, path: "/register" },
        { text: "야구배트", icon: <SportsBaseballIcon />, path: "/bats" },
        { text: "배팅장갑", icon: <SportsMmaIcon />, path: "/batting-gloves" },
        { text: "보호장비", icon: <HealthAndSafetyIcon />, path: "/protection" },
        { text: "글러브", icon: <SportsHandballIcon />, path: "/gloves" },
        { text: "야구화", icon: <SportsHandballIcon />, path: "/shoes" },
        { text: "장바구니", icon: <ShoppingCartIcon />, path: "/cart" },
      ];

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Typography
        variant="h6"
        sx={{
          my: 2,
          fontFamily: "'Roboto', 'Noto Sans KR', sans-serif",
          fontWeight: 500,
        }}
      >
        ⚾ 야구 용품점
      </Typography>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton component={Link} to={item.path}>
              {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
        {nickname && (
          <ListItem disablePadding>
            <ListItemButton onClick={handleOpenDialog}>
              <ListItemText primary="로그아웃" />
            </ListItemButton>
          </ListItem>
        )}
      </List>
    </Box>
  );

  if (loading) {
    return (
      <AppBar position="fixed" color="primary">
        <Toolbar>
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              fontFamily: "'Roboto', 'Noto Sans KR', sans-serif",
              fontWeight: 500,
            }}
          >
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
    <>
      <AppBar position="fixed" color="primary">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { lg: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              fontFamily: "'Roboto', 'Noto Sans KR', sans-serif",
              fontWeight: 500,
              whiteSpace: "nowrap",
              overflow: "visible",
            }}
          >
            <Link to="/" style={{ textDecoration: "none", color: "white" }}>
              ⚾ 야구 용품점
            </Link>
          </Typography>

          <Box
            sx={{
              display: { xs: "none", lg: "flex" },
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 1,
            }}
          >
            {nickname ? (
              <>
                <Typography
                  variant="body1"
                  sx={{
                    marginRight: 2,
                    color: "white",
                    fontFamily: "'Roboto', 'Noto Sans KR', sans-serif",
                    fontSize: "1rem",
                  }}
                >
                  {nickname}님 환영합니다!
                </Typography>
                {isAdmin ? (
                  <>
                    <Button
                      color="inherit"
                      component={Link}
                      to="/admin/products"
                      startIcon={<InventoryIcon />}
                      sx={{
                        fontSize: "1rem",
                        textTransform: "none",
                        px: 1,
                      }}
                    >
                      상품 관리
                    </Button>
                    <Button
                      color="inherit"
                      component={Link}
                      to="/admin/reviews"
                      startIcon={<RateReviewIcon />}
                      sx={{
                        fontSize: "1rem",
                        textTransform: "none",
                        px: 1,
                      }}
                    >
                      리뷰 관리
                    </Button>
                    <Button
                      color="inherit"
                      component={Link}
                      to="/admin/shipping"
                      startIcon={<LocalShippingIcon />}
                      sx={{
                        fontSize: "1rem",
                        textTransform: "none",
                        px: 1,
                      }}
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
                      sx={{
                        fontSize: "1rem",
                        textTransform: "none",
                        px: 1,
                      }}
                    >
                      마이페이지
                    </Button>
                    <Button
                      color="inherit"
                      component={Link}
                      to="/review-list"
                      startIcon={<RateReviewIcon />}
                      sx={{
                        fontSize: "1rem",
                        textTransform: "none",
                        px: 1,
                      }}
                    >
                      구매후기
                    </Button>
                  </>
                )}
                <IconButton
                  color="inherit"
                  component={Link}
                  to="/cart"
                  sx={{ mx: 1 }}
                >
                  <ShoppingCartIcon />
                </IconButton>
                <Button
                  color="inherit"
                  component={Link}
                  to="/bats"
                  startIcon={<SportsBaseballIcon />}
                  sx={{
                    fontSize: "1rem",
                    textTransform: "none",
                    px: 1,
                  }}
                >
                  야구배트
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  to="/batting-gloves"
                  startIcon={<SportsMmaIcon />}
                  sx={{
                    fontSize: "1rem",
                    textTransform: "none",
                    px: 1,
                  }}
                >
                  배팅장갑
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  to="/protection"
                  startIcon={<HealthAndSafetyIcon />}
                  sx={{
                    fontSize: "1rem",
                    textTransform: "none",
                    px: 1,
                  }}
                >
                  보호장비
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  to="/gloves"
                  startIcon={<SportsHandballIcon />}
                  sx={{
                    fontSize: "1rem",
                    textTransform: "none",
                    px: 1,
                  }}
                >
                  글러브
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  to="/shoes"
                  startIcon={<SportsHandballIcon />}
                  sx={{
                    fontSize: "1rem",
                    textTransform: "none",
                    px: 1,
                  }}
                >
                  야구화
                </Button>
                <Button
                  color="inherit"
                  onClick={handleOpenDialog}
                  sx={{
                    fontSize: "1rem",
                    textTransform: "none",
                    px: 1,
                  }}
                >
                  로그아웃
                </Button>
              </>
            ) : (
              <>
                <Button
                  color="inherit"
                  component={Link}
                  to="/login"
                  sx={{
                    fontSize: "1rem",
                    textTransform: "none",
                    px: 1,
                  }}
                >
                  로그인
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  to="/register"
                  sx={{
                    fontSize: "1rem",
                    textTransform: "none",
                    px: 1,
                  }}
                >
                  회원가입
                </Button>
                <IconButton
                  color="inherit"
                  component={Link}
                  to="/cart"
                  sx={{ mx: 1 }}
                >
                  <ShoppingCartIcon />
                </IconButton>
                <Button
                  color="inherit"
                  component={Link}
                  to="/bats"
                  startIcon={<SportsBaseballIcon />}
                  sx={{
                    fontSize: "1rem",
                    textTransform: "none",
                    px: 1,
                  }}
                >
                  야구배트
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  to="/batting-gloves"
                  startIcon={<SportsMmaIcon />}
                  sx={{
                    fontSize: "1rem",
                    textTransform: "none",
                    px: 1,
                  }}
                >
                  배팅장갑
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  to="/protection"
                  startIcon={<HealthAndSafetyIcon />}
                  sx={{
                    fontSize: "1rem",
                    textTransform: "none",
                    px: 1,
                  }}
                >
                  보호장비
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  to="/gloves"
                  startIcon={<SportsHandballIcon />}
                  sx={{
                    fontSize: "1rem",
                    textTransform: "none",
                    px: 1,
                  }}
                >
                  글러브
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  to="/shoes"
                  startIcon={<SportsHandballIcon />}
                  sx={{
                    fontSize: "1rem",
                    textTransform: "none",
                    px: 1,
                  }}
                >
                  야구화
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", lg: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: 240 },
        }}
      >
        {drawer}
      </Drawer>

      <Dialog
        open={openDialog}
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
    </>
  );
}