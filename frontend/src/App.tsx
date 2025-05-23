import CssBaseline from "@mui/material/CssBaseline";
import { BrowserRouter as Router } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/footer";
import { Box } from "@mui/material";
import RoutesConfig from "./RoutesConfig";
import { AuthProvider } from "../src/AdminPage/AuthContext"; // AuthProvider 추가

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
          }}
        >
          <CssBaseline />
          <Navbar />
          <Box sx={{ flex: 1, pb: "80px",
            maxWidth: {
              xs: "375px",
              sm: "600px",
              md: "900px",
              lg: "1200px",
              xl: "1536px",
            },
            width: "100%", // 부모 너비를 따름
           }}>
            <RoutesConfig />
          </Box>
          <Footer />
        </Box>
      </AuthProvider>
    </Router>
  );
}