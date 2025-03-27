    // NotFound.tsx
import { Container, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ mt: 5, textAlign: "center" }}>
      <Typography variant="h4" gutterBottom>
        404 - 페이지를 찾을 수 없습니다
      </Typography>
      <Typography variant="body1" gutterBottom>
        요청하신 페이지는 존재하지 않습니다.
      </Typography>
      <Button variant="contained" color="primary" onClick={() => navigate("/")}>
        홈으로 돌아가기
      </Button>
    </Container>
  );
};

export default NotFound;