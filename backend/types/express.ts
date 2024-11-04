import { Request } from 'express';

// 기본 사용자 인터페이스
export interface AuthUser {
  id: number;
  email: string;
  nickname?: string;
}

// 기본 페이지네이션 쿼리 인터페이스
export interface PaginationQuery {
  page?: string;
  limit?: string;
}

// 감정 트렌드 쿼리 인터페이스
export interface EmotionTrendQuery extends PaginationQuery {
  start_date: string;
  end_date: string;
  group_by?: 'day' | 'week' | 'month';
}

// 감정 생성 인터페이스
export interface EmotionCreate {
  emotion_ids: number[];
  note?: string;
}

// AuthRequest 타입 정의
export interface AuthRequest extends Request {
  user?: AuthUser;
}

// 제네릭 AuthRequest 타입 정의
export interface AuthRequestGeneric<B = any, Q = any, P = any> extends Request<P, any, B, Q> {
  user?: AuthUser;
}