import React from "react";
import { Container, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const PurchaseComplete: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ mt: 10, textAlign: "center" }}>
      <Typography variant="h4" gutterBottom>
        결제가 완료되었습니다!
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        주문해주셔서 감사합니다. 주문 내역은 마이페이지에서 확인하실 수 있습니다.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate("/")}
        sx={{ px: 4, py: 1.5 }}
      >
        홈으로 돌아가기
      </Button>
    </Container>
  );
};

export default PurchaseComplete;