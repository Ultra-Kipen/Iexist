// userController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../models';
import { JWT_SECRET } from '../config';
import { AuthRequest } from '../middleware/authMiddleware';

class UserController {
  async register(req: Request, res: Response) {
    const transaction = await db.sequelize.transaction();
    try {
      const { username, email, password, nickname } = req.body;

      const existingUser = await db.sequelize.models.users.findOne({
        where: { email },
        transaction
      });

      if (existingUser) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: '이미 사용 중인 이메일입니다.'
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await db.sequelize.models.users.create({
        username,
        email,
        password: hashedPassword,
        nickname: nickname || null
      }, { transaction });

      const userData = user.toJSON();

      const token = jwt.sign(
        { id: userData.id }, // user_id를 id로 변경
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      await transaction.commit();
      return res.status(201).json({
        success: true,
        data: {
          token,
          user: {
            id: userData.id,  // user_id를 id로 변경
            username: userData.username,
            email: userData.email,
            nickname: userData.nickname
          }
        }
      });

    } catch (error) {
      if (transaction) await transaction.rollback();
      console.error('사용자 등록 오류:', error);
      return res.status(500).json({
        success: false,
        error: '서버 오류가 발생했습니다.'
      });
    }
  }

  async login(req: Request, res: Response) {
    const transaction = await db.sequelize.transaction();
    try {
      const { email, password } = req.body;

      const user = await db.sequelize.models.users.findOne({
        where: { email },
        attributes: ['id', 'username', 'email', 'password', 'nickname'], // user_id를 id로 변경
        transaction
      });

      if (!user) {
        await transaction.rollback();
        return res.status(401).json({
          success: false,
          error: '이메일 또는 비밀번호가 올바르지 않습니다.'
        });
      }

      const userData = user.toJSON();
      const isPasswordValid = await bcrypt.compare(password, userData.password); // get()을 toJSON()으로 변경

      if (!isPasswordValid) {
        await transaction.rollback();
        return res.status(401).json({
          success: false, 
          error: '이메일 또는 비밀번호가 올바르지 않습니다.'
        });
      }

      const token = jwt.sign(
        { id: userData.id }, // user_id를 id로 변경
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      await transaction.commit();
      return res.json({
        success: true,
        data: {
          token,
          user: {
            id: userData.id, // user_id를 id로 변경
            username: userData.username,
            email: userData.email,
            nickname: userData.nickname
          }
        }
      });

    } catch (error) {
      if (transaction) await transaction.rollback();
      console.error('로그인 오류:', error);
      return res.status(500).json({
        success: false,
        error: '서버 오류가 발생했습니다.'
      });
    }
  }

  async updateProfile(req: AuthRequest, res: Response) {
    const transaction = await db.sequelize.transaction();
    try {
      const user = req.user;
      if (!user?.id) {
        await transaction.rollback();
        return res.status(401).json({
          success: false,
          error: '인증이 필요합니다.'
        });
      }

      const { nickname, theme_preference } = req.body;

      const userToUpdate = await db.sequelize.models.users.findByPk(user.id, {
        transaction
      });

      if (!userToUpdate) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          error: '사용자를 찾을 수 없습니다.'
        });
      }

      // 업데이트할 필드만 포함
      const updateFields: any = {};
      if (nickname !== undefined) updateFields.nickname = nickname;
      if (theme_preference !== undefined) updateFields.theme_preference = theme_preference;

      await userToUpdate.update(updateFields, { transaction });

      const updatedUser = await db.sequelize.models.users.findByPk(user.id, {
        attributes: ['id', 'username', 'email', 'nickname', 'theme_preference'],
        transaction
      });

      await transaction.commit();
      
      return res.json({
        success: true,
        data: {
          id: updatedUser?.get('id'),
          username: updatedUser?.get('username'),
          email: updatedUser?.get('email'),
          nickname: updatedUser?.get('nickname'),
          theme_preference: updatedUser?.get('theme_preference')
        }
      });

    } catch (error) {
      await transaction.rollback();
      console.error('프로필 업데이트 오류:', error);
      return res.status(500).json({
        success: false,
        error: '서버 오류가 발생했습니다.'
      });
    }
  } // 메서드 닫는 중괄호 추가
} // 클래스 닫는 중괄호 추가

export default new UserController(); // 클래스 밖으로 이동