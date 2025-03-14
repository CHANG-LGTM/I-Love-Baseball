// src/types/auth.ts
export interface AuthRequest {
    email: string;
    password: string;
    nickname:string;
    role?: string; // 선택적 필드 (백엔드에서 요구 시)
  }
  
  export interface AuthResponse {
    token: string;
  }