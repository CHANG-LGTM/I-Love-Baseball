// AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";

interface AuthContextType {
  nickname: string | null;
  setNickname: (nickname: string | null) => void;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [nickname, setNickname] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const checkAuth = async (): Promise<boolean> => {
    try {
      const response = await axios.get<{ roles: string[]; nickname?: string }>(
        "http://localhost:8092/api/auth/check-role",
        { withCredentials: true }
      );
      console.log("Check auth response:", response.data);
      const { roles, nickname: fetchedNickname } = response.data;

      setIsAdmin(roles.includes("ADMIN"));
      if (fetchedNickname) {
        setNickname(fetchedNickname);
        localStorage.setItem("nickname", fetchedNickname);
        return true;
      } else {
        setNickname(null);
        setIsAdmin(false);
        localStorage.removeItem("nickname");
        return false;
      }
    } catch (err) {
      console.error("인증 확인 실패:", err);
      setNickname(null);
      setIsAdmin(false);
      localStorage.removeItem("nickname");
      return false;
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ nickname, setNickname, isAdmin, setIsAdmin, checkAuth }}>
      {children}
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