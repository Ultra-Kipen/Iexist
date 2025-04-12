import { Request } from 'express';

declare global {
  namespace Express {
    interface User {
      user_id: number;
      email: string;
      nickname?: string;
      is_active: boolean;
    }
  }
}

export interface AuthRequest extends Request {
  user?: Express.User;
}

export interface AuthRequestGeneric<
  ReqBody = any,
  QueryString = any,
  Params = any
> extends Request<Params, any, ReqBody, QueryString> {
  user?: Express.User;
}