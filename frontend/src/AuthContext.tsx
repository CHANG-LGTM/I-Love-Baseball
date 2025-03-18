import React, { createContext, useContext, useState, ReactNode } from 'react';

// Context의 타입 정의
interface AuthContextType {
  nickname: string | null;
  setNickname: (nickname: string | null) => void;
  token: string | null;
  setToken: (token: string | null) => void;
}

// Context 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider 컴포넌트 생성
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [nickname, setNickname] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  return (
    <AuthContext.Provider value={{ nickname, setNickname, token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};

// Context를 사용하는 커스텀 훅
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
