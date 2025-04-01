import { createContext, useContext, useState, useEffect, ReactNode } from "react";
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [nickname, setNickname] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isChecking, setIsChecking] = useState<boolean>(false); // 중복 호출 방지 플래그

  const checkAuth = async (): Promise<boolean> => {
    if (isChecking) {
      console.log("이미 인증 확인 중, 재호출 방지");
      return false;
    }

    if (!loading && nickname !== null) {
      console.log("이미 인증 확인됨, 재호출 방지");
      return true;
    }

    console.trace("checkAuth 호출됨");
    setIsChecking(true);
    setLoading(true);

    try {
      const response = await axios.get<{ roles: string[]; nickname?: string; token?: string }>(
        "http://localhost:8092/api/auth/check-role",
        { withCredentials: true }
      );
      console.log("Check auth response:", response.data);
      const { roles, nickname: fetchedNickname, token: authToken } = response.data;

      if (fetchedNickname) {
        setNickname(fetchedNickname);
        setIsAdmin(roles.includes("ADMIN"));
        setToken(authToken || null);
        localStorage.setItem("nickname", fetchedNickname);
        if (authToken) {
          localStorage.setItem("token", authToken);
        }
        return true;
      } else {
        setNickname(null);
        setIsAdmin(false);
        setToken(null);
        localStorage.removeItem("nickname");
        localStorage.removeItem("token");
        return false;
      }
    } catch (err) {
      console.error("인증 확인 실패:", err);
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
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedNickname = localStorage.getItem("nickname");

    if (storedToken && storedNickname) {
      setToken(storedToken);
      setNickname(storedNickname);
      setLoading(false); // 저장된 데이터가 있으면 바로 로딩 종료
    } else {
      checkAuth(); // 저장된 데이터가 없으면 인증 확인
    }
  }, []); // 의존성 배열 비움

  return (
    <AuthContext.Provider
      value={{ nickname, setNickname, isAdmin, setIsAdmin, checkAuth, token, loading }}
    >
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
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