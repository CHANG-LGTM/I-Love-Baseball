import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import axios from "axios";
import { Box, Typography } from "@mui/material";

interface AuthContextType {
  nickname: string | null;
  setNickname: (nickname: string | null) => void;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  checkAuth: () => Promise<boolean>;
  token: string | null;
  loading: boolean;
}

interface AuthResponse {
  roles?: string[];
  nickname?: string;
  token?: string;
}

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL || "http://localhost:8092";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [nickname, setNickname] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  const checkAuth = useCallback(async (): Promise<boolean> => {
    if (isChecking) return false;
    if (!loading && nickname !== null) return true;

    setIsChecking(true);
    setLoading(true);

    try {
      const response = await axios.get<AuthResponse>(
        `${API_BASE_URL}/api/auth/check-role`,
        { withCredentials: true }
      );

      const { roles = [], nickname: fetchedNickname, token: authToken } = response.data;

      if (fetchedNickname) {
        setNickname(fetchedNickname);
        setIsAdmin(roles.includes("ADMIN"));
        setToken(authToken || null);
        localStorage.setItem("nickname", fetchedNickname);
        if (authToken) {
          localStorage.setItem("token", authToken);
        }
        return true;
      }

      // 인증 실패 시 처리
      setNickname(null);
      setIsAdmin(false);
      setToken(null);
      localStorage.removeItem("nickname");
      localStorage.removeItem("token");
      return false;
    } catch (err) {
      console.log(err)
      setNickname(null);
      setIsAdmin(false);
      setToken(null);
      localStorage.removeItem("nickname");
      localStorage.removeItem("token");
      return false;
    } finally {
      setLoading(false);
      setIsChecking(false);
    }
  }, [isChecking, loading, nickname]);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("token");
      const storedNickname = localStorage.getItem("nickname");

      if (storedToken && storedNickname) {
        setToken(storedToken);
        setNickname(storedNickname);
        setLoading(false);
      } else {
        await checkAuth();
      }
    };

    if(loading) initializeAuth();
  }, [checkAuth, loading]);

  return (
    <AuthContext.Provider
      value={{ 
        nickname, 
        setNickname, 
        isAdmin, 
        setIsAdmin, 
        checkAuth, 
        token, 
        loading 
      }}
    >
      {loading ? (
        <Box sx={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          height: "100vh" 
        }}>
          <Typography variant="h6">인증 확인 중...</Typography>
        </Box>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};