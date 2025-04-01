import { Box, Typography } from "@mui/material";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function ShippingManagement() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
    }
  }, [isAdmin, navigate]);

  return (
    <Box sx={{ padding: 4, marginTop: 8 }}>
      <Typography variant="h4">배송 관리</Typography>
      <Typography sx={{ mt: 2 }}>배송 관리 기능은 준비 중입니다.</Typography>
    </Box>
  );
}