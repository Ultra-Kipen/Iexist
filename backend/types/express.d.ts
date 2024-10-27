import { Request } from 'express';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface AuthRequest<
  B = any,
  Q = any,
  P = any
> extends Request<P, any, B, Q> {
  user?: AuthUser;
}