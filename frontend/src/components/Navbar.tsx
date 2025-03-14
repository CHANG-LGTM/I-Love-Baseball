import { AppBar, Toolbar, Typography, Button, IconButton, Box } from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SportsBaseballIcon from "@mui/icons-material/SportsBaseball";
import SportsMmaIcon from "@mui/icons-material/SportsMma";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import SportsHandballIcon from "@mui/icons-material/SportsHandball";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const nickname = localStorage.getItem("nickname"); // 로그인한 사용자의 닉네임 가져오기

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("nickname");
    alert("로그아웃 되었습니다.");
    navigate("/login"); // 로그아웃 후 로그인 페이지로 이동
  };

  return (
    <AppBar position="fixed" color="primary">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          <Link to="/" style={{ textDecoration: "none", color: "white" }}>
            ⚾ 야구 용품점
          </Link>
        </Typography>

        {/* 로그인 상태 확인 후 UI 변경 */}
        {nickname ? (
          <>
            <Typography variant="body1" sx={{ marginRight: 2 }}>
              {nickname}님 환영합니다!
            </Typography>
            <Button color="inherit" onClick={handleLogout}>로그아웃</Button>
          </>
        ) : (
          <>
            <Button color="inherit" component={Link} to="/login">로그인</Button>
            <Button color="inherit" component={Link} to="/register">회원가입</Button>
          </>
        )}

        <IconButton color="inherit" component={Link} to="/cart">
          <ShoppingCartIcon />
        </IconButton>
        <Button color="inherit" component={Link} to="/bats" startIcon={<SportsBaseballIcon />}>야구배트</Button>
        <Button color="inherit" component={Link} to="/batting-gloves" startIcon={<SportsMmaIcon />}>배팅장갑</Button>
        <Button color="inherit" component={Link} to="/protection" startIcon={<HealthAndSafetyIcon />}>보호장비</Button>
        <Button color="inherit" component={Link} to="/gloves" startIcon={<SportsHandballIcon />}>글러브</Button>
        <Button color="inherit" component={Link} to="/shoes" startIcon={<SportsHandballIcon />}>야구화</Button>
      </Toolbar>
    </AppBar>
  );
}
