import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, TextField, Button, Typography, Card, CardContent, Alert, Box, MenuItem } from '@mui/material';

const Register: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [nickname, setNickname] = useState<string>('');
  const [role, setRole] = useState<string>('USER');
  const [error, setError] = useState<string | null>(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await axios.post(
        'http://localhost:8092/api/auth/register',
        { email, password, nickname, role },
        { headers: { 'Content-Type': 'application/json' } }
      );

      alert('회원가입 성공! 로그인 페이지로 이동합니다.');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || '회원가입 실패');
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
            <TextField
              label="닉네임"
              fullWidth
              margin="normal"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
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
              <Button type="submit" variant="contained" color="primary" fullWidth>
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