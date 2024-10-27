import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Op } from 'sequelize';
import db from '../models';
import { AuthRequest } from '../types/express';

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  nickname?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface ProfileUpdate {
  nickname?: string;
  profile_image_url?: string;
  background_image_url?: string;
  favorite_quote?: string;
  theme_preference?: 'light' | 'dark' | 'system';
  privacy_settings?: {
    profile_visibility?: 'public' | 'private' | 'friends';
    post_visibility?: 'public' | 'private' | 'friends';
    emotion_visibility?: 'public' | 'private' | 'friends';
  };
}

interface PasswordUpdate {
  current_password: string;
  new_password: string;
}

interface PasswordReset {
  token: string;
  new_password: string;
}

const userController = {
  register: async (req: AuthRequest<RegisterRequest>, res: Response) => {
    const transaction = await db.sequelize.transaction();
    try {
      const { username, email, password, nickname } = req.body;

      // Validation
      if (!username || username.length < 4 || username.length > 20) {
        await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: '사용자 이름은 4-20자 사이여야 합니다.'
        });
      }

      if (!email || !email.includes('@') || !email.includes('.')) {
        await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: '유효한 이메일 주소를 입력해주세요.'
        });
      }

      if (!password || password.length < 8) {
        await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: '비밀번호는 최소 8자 이상이어야 합니다.'
        });
      }

      // Duplicate checks
      const [existingUser, existingUsername] = await Promise.all([
        db.User.findOne({ where: { email }, transaction }),
        db.User.findOne({ where: { username }, transaction })
      ]);

      if (existingUser) {
        await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: '이미 사용 중인 이메일입니다.'
        });
      }

      if (existingUsername) {
        await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: '이미 사용 중인 사용자 이름입니다.'
        });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const newUser = await db.User.create({
        username,
        email,
        password_hash: hashedPassword,
        nickname: nickname || username,
        theme_preference: 'system',
        privacy_settings: {
          profile_visibility: 'public',
          post_visibility: 'public',
          emotion_visibility: 'public'
        }
      }, { transaction });

      // Create initial user stats
      await db.UserStats.create({
        user_id: newUser.user_id
      }, { transaction });

      const token = jwt.sign(
        { userId: newUser.user_id },
        process.env.JWT_SECRET as string,
        { expiresIn: '24h' }
      );

      await transaction.commit();

      res.status(201).json({
        status: 'success',
        message: '회원가입이 완료되었습니다.',
        data: {
          token,
          user: {
            id: newUser.user_id,
            username: newUser.username,
            email: newUser.email,
            nickname: newUser.nickname,
            theme_preference: newUser.theme_preference
          }
        }
      });
    } catch (error) {
      await transaction.rollback();
      console.error('회원가입 오류:', error);
      res.status(500).json({
        status: 'error',
        message: '회원가입 중 오류가 발생했습니다.'
      });
    }
  },

  login: async (req: AuthRequest<LoginRequest>, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          status: 'error',
          message: '이메일과 비밀번호를 입력해주세요.'
        });
      }

      const user = await db.User.findOne({
        where: { email },
        attributes: [
          'user_id', 
          'username', 
          'email', 
          'password_hash', 
          'nickname',
          'theme_preference',
          'privacy_settings'
        ]
      });

      if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return res.status(401).json({
          status: 'error',
          message: '이메일 또는 비밀번호가 올바르지 않습니다.'
        });
      }

      const token = jwt.sign(
        { userId: user.user_id },
        process.env.JWT_SECRET as string,
        { expiresIn: '24h' }
      );

      // Update last login time
      await user.update({
        last_login_at: new Date()
      });

      res.json({
        status: 'success',
        message: '로그인에 성공했습니다.',
        data: {
          token,
          user: {
            id: user.user_id,
            username: user.username,
            email: user.email,
            nickname: user.nickname,
            theme_preference: user.theme_preference,
            privacy_settings: user.privacy_settings
          }
        }
      });
    } catch (error) {
      console.error('로그인 오류:', error);
      res.status(500).json({
        status: 'error',
        message: '로그인 중 오류가 발생했습니다.'
      });
    }
  },

  getProfile: async (req: AuthRequest, res: Response) => {
    try {
      const user_id = req.user?.id;

      if (!user_id) {
        return res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
      }

      const user = await db.User.findByPk(user_id, {
        attributes: {
          exclude: ['password_hash', 'reset_token', 'reset_token_expiry']
        },
        include: [{
          model: db.UserStats,
          attributes: [
            'my_day_post_count',
            'someone_day_post_count',
            'my_day_like_received_count',
            'someone_day_like_received_count'
          ]
        }]
      });

      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: '사용자를 찾을 수 없습니다.'
        });
      }

      res.json({
        status: 'success',
        data: { user }
      });
    } catch (error) {
      console.error('프로필 조회 오류:', error);
      res.status(500).json({
        status: 'error',
        message: '프로필 조회 중 오류가 발생했습니다.'
      });
    }
  },

  updateProfile: async (req: AuthRequest<ProfileUpdate>, res: Response) => {
    const transaction = await db.sequelize.transaction();
    try {
      const user_id = req.user?.id;
      const updateData = req.body;

      if (!user_id) {
        await transaction.rollback();
        return res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
      }

      if (updateData.nickname && (updateData.nickname.length < 2 || updateData.nickname.length > 20)) {
        await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: '닉네임은 2-20자 사이여야 합니다.'
        });
      }

      const user = await db.User.findByPk(user_id, { transaction });
      if (!user) {
        await transaction.rollback();
        return res.status(404).json({
          status: 'error',
          message: '사용자를 찾을 수 없습니다.'
        });
      }

      await user.update(updateData, { transaction });
      await transaction.commit();

      res.json({
        status: 'success',
        message: '프로필이 성공적으로 업데이트되었습니다.',
        data: {
          user: {
            id: user.user_id,
            username: user.username,
            nickname: user.nickname,
            theme_preference: user.theme_preference,
            privacy_settings: user.privacy_settings
          }
        }
      });
    } catch (error) {
      await transaction.rollback();
      console.error('프로필 업데이트 오류:', error);
      res.status(500).json({
        status: 'error',
        message: '프로필 업데이트 중 오류가 발생했습니다.'
      });
    }
  },

  updatePassword: async (req: AuthRequest<PasswordUpdate>, res: Response) => {
    const transaction = await db.sequelize.transaction();
    try {
      const user_id = req.user?.id;
      const { current_password, new_password } = req.body;

      if (!user_id) {
        await transaction.rollback();
        return res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
      }

      if (!new_password || new_password.length < 8) {
        await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: '새 비밀번호는 최소 8자 이상이어야 합니다.'
        });
      }

      const user = await db.User.findByPk(user_id, { transaction });
      if (!user) {
        await transaction.rollback();
        return res.status(404).json({
          status: 'error',
          message: '사용자를 찾을 수 없습니다.'
        });
      }

      const isPasswordValid = await bcrypt.compare(current_password, user.password_hash);
      if (!isPasswordValid) {
        await transaction.rollback();
        return res.status(401).json({
          status: 'error',
          message: '현재 비밀번호가 올바르지 않습니다.'
        });
      }

      const hashedPassword = await bcrypt.hash(new_password, 12);
      await user.update({ password_hash: hashedPassword }, { transaction });

      await transaction.commit();
      res.json({
        status: 'success',
        message: '비밀번호가 성공적으로 변경되었습니다.'
      });
    } catch (error) {
      await transaction.rollback();
      console.error('비밀번호 변경 오류:', error);
      res.status(500).json({
        status: 'error',
        message: '비밀번호 변경 중 오류가 발생했습니다.'
      });
    }
  },

  resetPassword: async (req: AuthRequest<PasswordReset>, res: Response) => {
    const transaction = await db.sequelize.transaction();
    try {
      const { token, new_password } = req.body;

      if (!new_password || new_password.length < 8) {
        await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: '새 비밀번호는 최소 8자 이상이어야 합니다.'
        });
      }

      const user = await db.User.findOne({
        where: {
          reset_token: token,
          reset_token_expiry: { [Op.gt]: new Date() }
        },
        transaction
      });

      if (!user) {
        await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: '유효하지 않거나 만료된 토큰입니다.'
        });
      }

      const hashedPassword = await bcrypt.hash(new_password, 12);
      await user.update({
        password_hash: hashedPassword,
        reset_token: null,
        reset_token_expiry: null
      }, { transaction });

      await transaction.commit();
      res.json({
        status: 'success',
        message: '비밀번호가 성공적으로 재설정되었습니다.'
      });
    } catch (error) {
      await transaction.rollback();
      console.error('비밀번호 재설정 오류:', error);
      res.status(500).json({
        status: 'error',
        message: '비밀번호 재설정 중 오류가 발생했습니다.'
      });
    }
  },

  deleteAccount: async (req: AuthRequest, res: Response) => {
    const transaction = await db.sequelize.transaction();
    try {
      const user_id = req.user?.id;

      if (!user_id) {
        await transaction.rollback();
        return res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
      }

      const user = await db.User.findByPk(user_id, { transaction });
      if (!user) {
        await transaction.rollback();
        return res.status(404).json({
          status: 'error',
          message: '사용자를 찾을 수 없습니다.'
        });
      }

      // Soft delete implementation
      await user.update({
        is_deleted: true,
        deleted_at: new Date(),
        email: `deleted_${user.user_id}_${user.email}`,
        username: `deleted_${user.user_id}_${user.username}`
      }, { transaction });

      await transaction.commit();
      res.json({
        status: 'success',
        message: '계정이 성공적으로 삭제되었습니다.'
      });
    } catch (error) {
      await transaction.rollback();
      console.error('계정 삭제 오류:', error);
      res.status(500).json({
        status: 'error',
        message: '계정 삭제 중 오류가 발생했습니다.'
      });
    }
  }
};

export default userController;