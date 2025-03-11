import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import Navbar from "./components/Navbar";
import MainPage from "./pages/MainPage";
import ProductCategory from "./pages/ProductCategory";

export default function App() {
  return (
    <Router>
      <CssBaseline />
      <Navbar />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/:category" element={<ProductCategory />} />
      </Routes>
    </Router>
  );
}
