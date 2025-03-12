// Navbar.tsx
import { AppBar, Toolbar, Typography, Button, IconButton } from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SportsBaseballIcon from "@mui/icons-material/SportsBaseball";
import SportsMmaIcon from "@mui/icons-material/SportsMma";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import SportsHandballIcon from "@mui/icons-material/SportsHandball";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <AppBar position="fixed" color="primary">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          <Link to="/" style={{ textDecoration: "none", color: "white" }}>
            ⚾ 야구 용품점
          </Link>
        </Typography>
        <Button color="inherit" component={Link} to="/login">로그인</Button>
        <Button color="inherit" component={Link} to="/signup">회원가입</Button>
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
