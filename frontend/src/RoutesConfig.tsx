// RoutesConfig.tsx
import { Route, Routes } from "react-router-dom";
import MainPage from "./pages/MainPage";
import ProductCategory from "./pages/ProductCategory";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ProductDetail from "./pages/ProductDetail";
import PurchasePage from "./pages/PurchasePage";
import CartPage from "./pages/CartPage";
import PurchaseComplete from "./pages/PurchaseComplete";
import PurchaseFail from "./pages/PurchaseFail";
import AdminProductList from "./AdminPage/AdminProductList";
import AdminProductForm from "./AdminPage/AdminProductForm";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./pages/ProtectedRoute";

const RoutesConfig = () => {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/cart" element={<ProtectedRoute element={<CartPage />} />} />
      <Route path="/checkout" element={<ProtectedRoute element={<PurchasePage />} />} />
      <Route path="/purchase/complete" element={<ProtectedRoute element={<PurchaseComplete />} />} />
      <Route path="/purchase/fail" element={<ProtectedRoute element={<PurchaseFail />} />} />
      <Route
        path="/admin/products"
        element={<ProtectedRoute element={<AdminProductList />} adminOnly />}
      />
      <Route
        path="/admin/products/new"
        element={<ProtectedRoute element={<AdminProductForm />} adminOnly />}
      />
      <Route
        path="/admin/products/edit/:id"
        element={<ProtectedRoute element={<AdminProductForm />} adminOnly />}
      />
      <Route path="/:category" element={<ProductCategory />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default RoutesConfig;