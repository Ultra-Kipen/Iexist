// 사용자 타입 정의
export interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

// 로그인 응답 타입 정의
export interface LoginResponse {
  token: string;
  user: User;
}

// 게시물 타입 정의
export interface Post {
  id: number;
  userId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// 감정 타입 정의
export interface Emotion {
  id: number;
  name: string;
  icon: string;
  color: string;
}