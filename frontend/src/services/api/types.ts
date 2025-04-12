export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface RegisterData {
    username: string;
    email: string;
    password: string;
  }
  
  export interface User {
    user_id: number;
    username: string;
    email: string;
    nickname?: string;
  }
  
  export interface AuthResponse {
    status: string;
    message: string;
    data: {
      token: string;
      user: User;
    };
  }