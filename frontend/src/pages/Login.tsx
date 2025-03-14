import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Container,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Alert,
  Box,
} from "@mui/material";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [nickname, setNickname] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // ✅ 로딩 상태 추가
  const navigate = useNavigate();

  // ✅ 로그인 상태 확인
  const fetchUserData = async () => {
    try {
      const response = await axios.get("http://localhost:8092/api/user", {
        withCredentials: true, // ✅ 쿠키 자동 포함
      });
      setNickname(response.data.nickname);
    } catch (error) {
      console.error("사용자 정보 가져오기 실패:", error);
      setNickname(null);
    } finally {
      setLoading(false); // ✅ 로딩 완료
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // ✅ 로그인 요청
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await axios.post(
        "http://localhost:8092/api/auth/login",
        { email: email.trim(), password: password.trim() },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true, // ✅ 쿠키 포함
        }
      );
      setNickname(response.data.nickname);
      alert(`${response.data.nickname}님 환영합니다!`);
      navigate("/");
    } catch (err: any) {
      console.error("로그인 실패:", err.response?.data || err.message);
      setError(err.response?.data?.error || "로그인 실패");
    }
  };

  // ✅ 로그아웃 요청
  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:8092/api/auth/logout", {}, { withCredentials: true });
      setNickname(null);
      alert("로그아웃되었습니다.");
      navigate("/");
    } catch (error) {
      console.error("로그아웃 실패:", error);
      alert("로그아웃에 실패했습니다.");
    }
  };

  // ✅ SNS 로그인
  const handleSNSLogin = (provider: string) => {
    window.location.href = `http://localhost:8092/oauth2/authorize/${provider}?redirect_uri=http://localhost:5173`;
  };

  return (
    <Container maxWidth="xs">
      <Card sx={{ mt: 20, p: 3 }}>
        <CardContent>
          {loading ? (
            <Typography align="center">로딩 중...</Typography> // ✅ 로딩 중 표시
          ) : (
            <>
              <Typography variant="h5" align="center" gutterBottom>
                {nickname ? `${nickname}님, 환영합니다!` : "로그인"}
              </Typography>

              {error && <Alert severity="error">{error}</Alert>}

              {!nickname ? (
                <form onSubmit={handleSubmit}>
                  <TextField
                    label="이메일"
                    type="email"
                    fullWidth
                    margin="normal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <TextField
                    label="비밀번호"
                    type="password"
                    fullWidth
                    margin="normal"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Box mt={2}>
                    <Button type="submit" variant="contained" color="primary" fullWidth>
                      로그인
                    </Button>
                  </Box>
                </form>
              ) : (
                <Button
                  onClick={handleLogout}
                  variant="contained"
                  color="secondary"
                  fullWidth
                >
                  로그아웃
                </Button>
              )}

              {!nickname && (
                <>
                  <Box mt={2} display="flex" justifyContent="space-between">
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleSNSLogin("google")}
                      fullWidth
                      sx={{ mr: 1 }}
                    >
                      Google 로그인
                    </Button>
                    <Button
                      variant="outlined"
                      color="warning"
                      onClick={() => handleSNSLogin("kakao")}
                      fullWidth
                      sx={{ mr: 1 }}
                    >
                      Kakao 로그인
                    </Button>
                    <Button
                      variant="outlined"
                      color="success"
                      onClick={() => handleSNSLogin("naver")}
                      fullWidth
                    >
                      Naver 로그인
                    </Button>
                  </Box>
                  <Typography align="center" mt={2}>
                    계정이 없으신가요?{" "}
                    <Button onClick={() => navigate("/register")} size="small">
                      회원가입
                    </Button>
                  </Typography>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default Login;