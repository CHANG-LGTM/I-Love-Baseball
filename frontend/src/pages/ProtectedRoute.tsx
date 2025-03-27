// ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../AdminPage/AuthContext";
import { JSX } from "react";

const ProtectedRoute = ({ element, adminOnly = false }: { element: JSX.Element; adminOnly?: boolean }) => {
  const { nickname, isAdmin } = useAuth();

  if (!nickname) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return element;
};

export default ProtectedRoute;