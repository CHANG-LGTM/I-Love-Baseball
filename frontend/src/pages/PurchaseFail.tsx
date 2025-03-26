import React from "react";
import { Container, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const PurchaseFail: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ mt: 10, textAlign: "center" }}>
      <Typography variant="h4" gutterBottom>
        결제에 실패했습니다.
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        결제 처리 중 오류가 발생했습니다. 다시 시도해 주세요.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate("/cart")}
        sx={{ px: 4, py: 1.5 }}
      >
        장바구니로 돌아가기
      </Button>
    </Container>
  );
};

export default PurchaseFail;