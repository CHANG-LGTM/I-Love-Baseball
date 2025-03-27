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
          <Box sx={{ flex: 1, pb: "80px" }}>
            <RoutesConfig />
          </Box>
          <Footer />
        </Box>
      </AuthProvider>
    </Router>
  );
}