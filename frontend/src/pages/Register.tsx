import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AxiosError } from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, TextField, Button, Typography, Card, CardContent, Alert, Box, MenuItem } from '@mui/material';
import { debounce } from 'lodash';

interface RegisterErrorResponse {
  error?: string;
}

interface RegisterResponse {
  token: string;
  message?: string;
}

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL || "http://localhost:8092";

const Register: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [nickname, setNickname] = useState<string>('');
  const [role, setRole] = useState<string>('USER');
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const errorMsg = params.get('error');

    if (token) {
      localStorage.setItem('token', token);
      alert('SNS 로그인 성공!');
      navigate('/');
    } else if (errorMsg) {
      setError(errorMsg);
    } else {
      console.log('No token or error received');
    }
  }, [location, navigate]);

  // 이메일 중복 확인 (debounce 적용)
  const checkEmailAvailability = debounce(async (email: string) => {
    if (!email) {
      setEmailError(null);
      return;
    }
    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/check-email`, {
        params: { email },
        withCredentials: true, // CORS 요청에서 쿠키/세션 사용을 위해 추가
      });
      if (!response.data.available) {
        setEmailError('이미 사용 중인 이메일입니다.');
      } else {
        setEmailError(null);
      }
    } catch (err) {
      const axiosError = err as AxiosError;
      console.error('이메일 중복 확인 오류:', {
        message: axiosError.message,
        status: axiosError.response?.status,
        data: axiosError.response?.data,
      });
      setEmailError('이메일 확인 중 오류가 발생했습니다.');
    }
  }, 500);

  // 닉네임 중복 확인 (debounce 적용)
  const checkNicknameAvailability = debounce(async (nickname: string) => {
    if (!nickname) {
      setNicknameError(null);
      return;
    }
    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/check-nickname`, {
        params: { nickname },
        withCredentials: true, // CORS 요청에서 쿠키/세션 사용을 위해 추가
      });
      if (!response.data.available) {
        setNicknameError('이미 사용 중인 닉네임입니다.');
      } else {
        setNicknameError(null);
      }
    } catch (err) {
      const axiosError = err as AxiosError;
      console.error('닉네임 중복 확인 오류:', {
        message: axiosError.message,
        status: axiosError.response?.status,
        data: axiosError.response?.data,
      });
      setNicknameError('닉네임 확인 중 오류가 발생했습니다.');
    }
  }, 500);

  // 이메일 입력 시 중복 확인
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    checkEmailAvailability(newEmail);
  };

  // 닉네임 입력 시 중복 확인
  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNickname = e.target.value;
    setNickname(newNickname);
    checkNicknameAvailability(newNickname);
  };

  // 비밀번호 길이 검증
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (newPassword.length < 8) {
      setPasswordError('비밀번호는 최소 8자 이상이어야 합니다.');
    } else {
      setPasswordError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (emailError || nicknameError || passwordError) {
      setError('입력값을 확인해주세요.');
      return;
    }

    try {
      const response = await axios.post<RegisterResponse>(
        `${API_BASE_URL}/api/auth/register`,
        {
          email: email.trim(),
          password: password.trim(),
          nickname: nickname.trim() || undefined,
          role: role || undefined,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true, // CORS 요청에서 쿠키/세션 사용을 위해 추가
        }
      );

      const { token } = response.data;
      if (token) {
        localStorage.setItem('jwt', token);
      }

      alert('회원가입 성공! 로그인 페이지로 이동합니다.');
      navigate('/login');
    } catch (err) {
      const axiosError = err as AxiosError<RegisterErrorResponse>;
      const errorMessage = axiosError.response?.data?.error || '회원가입 실패';
      setError(errorMessage);
      console.error('회원가입 에러:', axiosError.response?.data);
    }
  };

  return (
    <Container maxWidth="xs">
      <Card sx={{ mt: 20, p: 3 }}>
        <CardContent>
          <Typography variant="h5" align="center" gutterBottom>
            회원가입
          </Typography>
          {error && <Alert severity="error">{error}</Alert>}
          <form onSubmit={handleSubmit}>
            <TextField
              label="이메일"
              type="email"
              fullWidth
              margin="normal"
              value={email}
              onChange={handleEmailChange}
              required
              error={!!emailError}
              helperText={emailError}
            />
            <TextField
              label="비밀번호"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={handlePasswordChange}
              required
              error={!!passwordError}
              helperText={passwordError}
            />
            <TextField
              label="닉네임"
              fullWidth
              margin="normal"
              value={nickname}
              onChange={handleNicknameChange}
              required
              error={!!nicknameError}
              helperText={nicknameError}
            />
            <TextField
              select
              label="역할 선택"
              fullWidth
              margin="normal"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <MenuItem value="USER">User</MenuItem>
            </TextField>
            <Box mt={2}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={!!emailError || !!nicknameError || !!passwordError}
              >
                가입하기
              </Button>
            </Box>
          </form>

          <Typography align="center" mt={2}>
            이미 계정이 있으신가요? <Button onClick={() => navigate('/login')} size="small">로그인</Button>
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Register;