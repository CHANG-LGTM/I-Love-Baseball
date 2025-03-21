import { Route, Routes } from "react-router-dom";
import MainPage from "./pages/MainPage";
import ProductCategory from "./pages/ProductCategory";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ProductDetail from "./pages/ProductDetail";
import PurchasePage from "./pages/PurchasePage";
import React from "react";
import CartPage from "./pages/CartPage";

const RoutesConfig = () => {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/:category" element={<ProductCategory />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/purchase/:id" element={<PurchasePage />} />
      <Route path="/cart" element={<CartPage />} />
    </Routes>
  );
};

export default RoutesConfig;
