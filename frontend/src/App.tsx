import CssBaseline from "@mui/material/CssBaseline";
import { BrowserRouter as Router } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Box } from "@mui/material";
import RoutesConfig from "./RoutesConfig"; // 라우터 설정을 별도 파일로 분리

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
          <RoutesConfig /> {/* 라우트 설정 컴포넌트 */}
        </Box>
        <Footer />
      </Box>
    </Router>
  );
}
