import CssBaseline from "@mui/material/CssBaseline";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import MainPage from "./pages/MainPage";
import ProductCategory from "./pages/ProductCategory";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Footer from "./components/Footer";
import { Box } from "@mui/material";
import ProductDetail from "./pages/ProductDetail";

export default function App() {
  return (
    <Router>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh", // 페이지 전체 높이를 100vh로 설정
        }}
      >
        <CssBaseline />
        <Navbar />
        <Box sx={{ flex: 1, pb: "80px" /* Footer 높이만큼 하단 여백 추가 */ }}>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/:category" element={<ProductCategory />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/product/:id" element={<ProductDetail />} /> {/* 상세 페이지 경로 추가 */}
          </Routes>
        </Box>
        <Footer />
      </Box>
    </Router>
  );
}