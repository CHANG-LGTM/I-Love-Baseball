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
import MyPage from "./pages/MyPage"; // 추가

import ReviewManagement from "./AdminPage/ReviewManagement"; // 추가
import ShippingManagement from "./AdminPage/ShippingManagement"; // 추가
import ReviewList from "./pages/ReviewList";
import WriteReviews from "./pages/WriteReviews";
import ShippingPage from "./pages/ShippingPage";


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
      
      {/* 일반 사용자 경로 */}
      <Route path="/mypage" element={<ProtectedRoute element={<MyPage />} />} />
      <Route path="/write-review" element={<ProtectedRoute element={<WriteReviews />} />} />
      <Route path="/review-list" element={<ReviewList />} />
      <Route path="/" element={<ReviewList />} /> {/* 기본 경로를 ReviewList로 설정 */}
      <Route path="/shipping" element={<ShippingPage />} />
      
      {/* 관리자 경로 */}
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
      <Route
        path="/admin/reviews"
        element={<ProtectedRoute element={<ReviewManagement />} adminOnly />}
      />
      <Route
        path="/admin/shipping"
        element={<ProtectedRoute element={<ShippingManagement />} adminOnly />}
      />
      
      {/* 카테고리 경로 (와일드카드보다 아래에 위치) */}
      <Route path="/:category" element={<ProductCategory />} />
      
      {/* 404 경로 (가장 아래) */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default RoutesConfig;