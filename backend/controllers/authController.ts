import { Request, Response } from 'express';
import db from '../models';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    console.log('Login attempt for email:', email);

    const user = await db.User.findOne({ where: { email } });

    if (!user) {
      console.log('User not found for email:', email);
      return res.status(404).json({ status: 'error', message: '사용자를 찾을 수 없습니다.' });
    }

    console.log('User found:', user);

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      console.log('Invalid password for email:', email);
      return res.status(401).json({ status: 'error', message: '비밀번호가 올바르지 않습니다.' });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }
    const token = jwt.sign({ user_id: user.user_id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    console.log('Login successful for email:', email);
    return res.status(200).json({ status: 'success', token });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ status: 'error', message: '로그인 중 오류가 발생했습니다.', details: (error as Error).message });
  }
};

export const register = async (req: Request, res: Response) => {
  const { email, password, username } = req.body;

  try {
    console.log('Register attempt for email:', email);

    const existingUser = await db.User.findOne({ where: { email } });

    if (existingUser) {
      console.log('User already exists for email:', email);
      return res.status(400).json({ status: 'error', message: '이미 존재하는 이메일입니다.' });
    }

    const hashedPassword = await bcrypt.hash(password, Number(process.env.BCRYPT_ROUNDS) || 12);

    const newUser = await db.User.create({
      email,
      password_hash: hashedPassword,
      username,
      is_active: true, // 기본값 설정
      created_at: new Date(), // 기본값 설정
      updated_at: new Date(), // 기본값 설정
      notification_settings: {
        like_notifications: true,
        comment_notifications: true,
        challenge_notifications: true,
        encouragement_notifications: true
      }
    });

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }
    const token = jwt.sign({ user_id: newUser.user_id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    console.log('Register successful for email:', email);
    return res.status(201).json({ status: 'success', token });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ status: 'error', message: '가입 중 오류가 발생했습니다.', details: (error as Error).message });
  }
};

const createUser = async (req: Request, res: Response) => {
  try {
    const { email, password, username } = req.body;
    const hashedPassword = await bcrypt.hash(password, Number(process.env.BCRYPT_ROUNDS) || 12); // Hash the password using bcrypt

    const newUser = await db.User.create({
      email,
      password_hash: hashedPassword,
      username,
      is_active: true, // 기본값 설정
      created_at: new Date(), // 기본값 설정
      updated_at: new Date(), // 기본값 설정
      notification_settings: {
        like_notifications: true,
        comment_notifications: true,
        challenge_notifications: true,
        encouragement_notifications: true
      }
    });

    return res.status(201).json(newUser);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
};

export default {
  login,
  register,
  createUser,
};
