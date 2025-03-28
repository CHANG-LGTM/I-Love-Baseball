// Login.tsx
import { useState, useEffect } from "react";
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
import { useAuth } from "../AdminPage/AuthContext";

const Login: React.FC = () => {
  const { nickname, setNickname, isAdmin, checkAuth } = useAuth();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const oauthSuccess = urlParams.get("success");
    if (oauthSuccess === "true") {
      checkAuth().then((isAuthenticated) => {
        if (isAuthenticated) {
          navigate("/");
        }
      });
    }
  }, [checkAuth, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:8092/api/auth/login",
        { email: email.trim(), password: password.trim() },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      const newNickname = response.data.nickname;
      if (newNickname) {
        setNickname(newNickname);
        localStorage.setItem("nickname", newNickname);
      }
      const isAuthenticated = await checkAuth();
      if (isAuthenticated) {
        navigate("/");
      } else {
        setError("로그인에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (err: any) {
      console.error("로그인 실패:", err.response?.data || err.message);
      setError(err.response?.data?.error || "로그인 실패");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:8092/api/auth/logout",
        {},
        { withCredentials: true }
      );
      localStorage.removeItem("nickname");
      setNickname(null);
      navigate("/");
    } catch (error) {
      console.error("로그아웃 실패:", error);
      alert("로그아웃에 실패했습니다.");
    }
  };

  const handleSNSLogin = (provider: string) => {
    window.location.href = `http://localhost:8092/oauth2/authorize/${provider}?redirect_uri=http://localhost:5173`;
  };

  return (
    <Container maxWidth="xs">
      <Card sx={{ mt: 20, p: 3 }}>
        <CardContent>
          {loading ? (
            <Typography align="center">로딩 중...</Typography>
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