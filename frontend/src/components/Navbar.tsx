import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SportsBaseballIcon from "@mui/icons-material/SportsBaseball";
import SportsHandballIcon from "@mui/icons-material/SportsHandball";
import SportsMmaIcon from "@mui/icons-material/SportsMma";
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
import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext"; // Context 파일 경로

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { nickname, setNickname } = useAuth(); // Context에서 nickname 관리
  const [open, setOpen] = useState(false);

  // nickname 상태 업데이트 (Context 기반)
  useEffect(() => {
    const storedNickname = localStorage.getItem("nickname");
    if (storedNickname && !nickname) {
      setNickname(storedNickname);
    } else if (!storedNickname && nickname) {
      setNickname(null);
    }
  }, [nickname, setNickname]);

  // 경로 변경 시 Dialog 상태 초기화
  useEffect(() => {
    setOpen(false); // 경로가 변경될 때마다 Dialog 닫음
  }, [location.pathname]);

  // nickname이 null일 때 Dialog 강제로 닫기
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("nickname");
    setNickname(null); // Context 상태 업데이트
    setOpen(false);
    navigate("/"); // 메인 페이지로 이동
  };

  return (
    <AppBar position="fixed" color="primary">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          <Link to="/" style={{ textDecoration: "none", color: "white" }}>
            ⚾ 야구 용품점
          </Link>
        </Typography>

        {nickname ? (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="body1" sx={{ marginRight: 2, color: "white" }}>
              {nickname}님 환영합니다!
            </Typography>
            <Button color="inherit" onClick={handleOpenDialog}>
              로그아웃
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Button color="inherit" component={Link} to="/login">
              로그인
            </Button>
            <Button color="inherit" component={Link} to="/register">
              회원가입
            </Button>
          </Box>
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
      </Toolbar>

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
    </AppBar>
  );
}