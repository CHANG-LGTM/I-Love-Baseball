import { Route, Routes, Navigate } from "react-router-dom";
import MainPage from "./pages/MainPage";
import ProductCategory from "./pages/ProductCategory";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ProductDetail from "./pages/ProductDetail";
import PurchasePage from "./pages/PurchasePage";
import React from "react";
import CartPage from "./pages/CartPage";
import PurchaseComplete from "./pages/PurchaseComplete";
import PurchaseFail from "./pages/PurchaseFail";
import AdminProductList from "./AdminPage/AdminProductList";
import AdminProductForm from "./AdminPage/AdminProductForm";

// ProtectedRoute 컴포넌트 정의
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const nickname = localStorage.getItem("nickname");
  const isLoggedIn = !!nickname;

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const RoutesConfig = () => {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/:category" element={<ProductCategory />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/admin/products" element={<AdminProductList />} />
      <Route path="/admin/products/new" element={<AdminProductForm />} />
      <Route path="/admin/products/edit/:id" element={<AdminProductForm />} />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <PurchasePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/purchase/:id"
        element={
          <ProtectedRoute>
            <PurchasePage />
          </ProtectedRoute>
        }
      />
      <Route path="/purchase/complete" element={<PurchaseComplete />} />
      <Route path="/purchase/fail" element={<PurchaseFail />} />
      {/* 404 페이지 */}
      <Route path="*" element={<div>404 - 페이지를 찾을 수 없습니다.</div>} />
    </Routes>
  );
};

export default RoutesConfig;