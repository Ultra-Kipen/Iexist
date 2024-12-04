import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types/express';
import { Op } from 'sequelize';
import { Model, DataTypes, Optional, Sequelize } from 'sequelize';
import UserModel from '../models/User';
import UserStatsModel from '../models/UserStats';
import db from '../models';
import { QueryTypes } from 'sequelize';
import { User, UserAttributes } from '../models/User';
interface IUserController {
register(req: Request, res: Response): Promise<Response>;
login(req: Request, res: Response): Promise<Response>;
updateProfile(req: AuthRequest, res: Response): Promise<Response>;
getProfile(req: AuthRequest, res: Response): Promise<Response>;
changePassword(req: AuthRequest, res: Response): Promise<Response>;
logout(req: AuthRequest, res: Response): Promise<Response>;
withdrawal(req: AuthRequest, res: Response): Promise<Response>;
checkEmail(req: Request, res: Response): Promise<Response>;
checkNickname(req: Request, res: Response): Promise<Response>;
updateNotificationSettings(req: AuthRequest, res: Response): Promise<Response>;
}
// JWT_SECRET 설정
const JWT_SECRET = process.env.JWT_SECRET || 'UiztNewcec/1sEvgkVnLuDjP6VVd8GpEORFOZnnkBwA=';
const JWT_EXPIRATION = '24h';

class UserController implements IUserController {
  
  async register(req: Request, res: Response) {
    const transaction = await db.sequelize.transaction();
    try {
      const { username, email, password } = req.body;
      
      // 비밀번호 유효성 검사 추가
      if (!password || password.length < 6 || !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(password)) {
        await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: '비밀번호는 영문과 숫자를 포함하여 6자 이상이어야 합니다.'
        });
      }
      
      const existingUser = await db.User.findOne({
        where: { email },
        transaction
      });
  
      if (existingUser) {
        await transaction.rollback();
        return res.status(409).json({
          status: 'error',
          message: '이미 존재하는 이메일입니다.'
        });
      }
  
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      
      const user = await db.User.create({
        username,
        email,
        password_hash: passwordHash, 
        nickname: username,
        theme_preference: 'system',
        is_active: true
      }, { 
        transaction
      }); 
      
      await db.sequelize.query(
        `INSERT INTO user_stats (
          user_id,
          my_day_post_count,  
          someone_day_post_count,
          my_day_like_received_count,
          someone_day_like_received_count,
          my_day_comment_received_count,
          someone_day_comment_received_count,
          challenge_count
        ) VALUES (?, 0, 0, 0, 0, 0, 0, 0)`,
        {
          replacements: [user.getDataValue('user_id')],
          type: QueryTypes.INSERT,
          transaction
        }
      );

      const token = jwt.sign(
        { user_id: user.dataValues.user_id },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRATION }
      );
      
      await transaction.commit();
      
      return res.status(201).json({
        status: 'success',
        message: '회원가입이 완료되었습니다.',
        data: {
          token,
          user: {
            user_id: user.dataValues.user_id,
            username: user.dataValues.username,
            email: user.dataValues.email
          }
        }
      });
   
      await transaction.commit();
   
      return res.status(201).json({
        status: 'success',
        message: '회원가입이 완료되었습니다.',
        data: {
          token,
          user: {
            user_id: user.dataValues.user_id,
            username: user.dataValues.username,  
            email: user.dataValues.email
          }
        }
      });
   
    } catch (error: any) {
      await transaction.rollback();
      console.error('회원가입 오류 상세:', error);
      return res.status(500).json({
        status: 'error', 
        message: '회원가입 처리 중 오류가 발생했습니다.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
   }


// 로그인 메서드 수정
async login(req: Request, res: Response) {
  const transaction = await db.sequelize.transaction();
  try {
    const { email, password } = req.body;

    const user = await db.User.findOne({
      where: { 
        email,
        is_active: true
      },
      attributes: [
        'user_id',
        'username', 
        'email',
        'password_hash',
        'nickname',
        'theme_preference',
        'is_active'
      ],
      transaction
    });

    if (!user) {
      await transaction.rollback();
      return res.status(401).json({
        status: 'error',
        message: '이메일 또는 비밀번호가 일치하지 않습니다.'
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password, 
      user.dataValues.password_hash
    );

    if (!isPasswordValid) {
      await transaction.rollback();
      return res.status(401).json({
        status: 'error',
        message: '이메일 또는 비밀번호가 일치하지 않습니다.'
      });
    }

    const token = jwt.sign(
      { user_id: user.dataValues.user_id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );

    await db.User.update(
      { last_login_at: new Date() },
      { 
        where: { user_id: user.dataValues.user_id },
        transaction 
      }
    );

    await transaction.commit();
    return res.json({
      status: 'success',
      message: '로그인이 완료되었습니다.',
      data: {
        token,
        user: {
          user_id: user.dataValues.user_id,
          username: user.dataValues.username,
          email: user.dataValues.email,
          nickname: user.dataValues.nickname,
          theme_preference: user.dataValues.theme_preference
        }
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('로그인 오류:', error);
    return res.status(500).json({
      status: 'error',
      message: '로그인 처리 중 오류가 발생했습니다.'
    });
  }
}


  
async updateProfile(req: AuthRequest, res: Response) {
  const transaction = await db.sequelize.transaction();
  try {
    const user_id = req.user?.user_id;
    if (!user_id) {
      await transaction.rollback();
      return res.status(401).json({
        status: 'error',
        message: '인증이 필요합니다.'
      });
    }

    const { nickname, theme_preference } = req.body;

    // 여기를 수정
    if (nickname) {
      const existingUser = await db.User.findOne({
        where: { 
          nickname,
          user_id: { [Op.ne]: user_id }
        },
        transaction
      });

      if (existingUser) {
        await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: '이미 사용 중인 닉네임입니다.'
        });
      }
    }

    const user = await db.User.findOne({
      where: { user_id },
      transaction
    });
    
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({
        status: 'error',
        message: '사용자를 찾을 수 없습니다.'
      });
    }
    
    await user.update({
      nickname: nickname || user.get('nickname'),
      theme_preference: theme_preference || user.get('theme_preference')
    }, { transaction });

    await transaction.commit();
    return res.json({
      status: 'success',
      message: '프로필이 성공적으로 업데이트되었습니다.',
      data: {
        nickname: user.get('nickname'),
        theme_preference: user.get('theme_preference')
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('프로필 업데이트 오류:', error);
    return res.status(500).json({
      status: 'error',
      message: '프로필 업데이트 중 오류가 발생했습니다.'
    });
  }
}

 

// getProfile 메서드 
async getProfile(req: AuthRequest, res: Response) {
  try {
    const user_id = req.user?.user_id;
    if (!user_id) {
      return res.status(401).json({
        status: 'error',
        message: '인증이 필요합니다.'
      });
    }

    const user = await db.User.findByPk(user_id, {
      attributes: ['user_id', 'username', 'email', 'nickname', 'theme_preference', 'profile_image_url', 'is_active']
    });

    return res.json({
      status: 'success',
      data: user
    });
  } catch (error) {
    console.error('프로필 조회 오류:', error);
    return res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
}

  // 비밀번호 변경
  async changePassword(req: AuthRequest, res: Response) {
    const transaction = await db.sequelize.transaction();
    try {
      const user_id = req.user?.user_id;
      if (!user_id) {
        await transaction.rollback();
        return res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
      }
  
      const { currentPassword, newPassword } = req.body;
      const user = await db.User.findByPk(user_id, { transaction });
  
      if (!user) {
        await transaction.rollback();
        return res.status(404).json({
          status: 'error',
          message: '사용자를 찾을 수 없습니다.'
        });
      }
  
      const isPasswordValid = await bcrypt.compare(currentPassword, user.dataValues.password_hash);
      if (!isPasswordValid) {
        await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: '현재 비밀번호가 올바르지 않습니다.'
        });
      }
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      await user.update({ password_hash: hashedPassword }, { transaction });
  
      await transaction.commit();
      return res.json({
        status: 'success',
        message: '비밀번호가 성공적으로 변경되었습니다.'
      });
    } catch (error) {
      await transaction.rollback();
      console.error('비밀번호 변경 오류:', error);
      return res.status(500).json({
        status: 'error',
        message: '서버 오류가 발생했습니다.'
      });
    }
  }

  // 로그아웃
  async logout(req: AuthRequest, res: Response) {
    return res.json({
      status: 'success',
      message: '로그아웃되었습니다.'
    });
  }

  // 회원탈퇴
  async withdrawal(req: AuthRequest, res: Response) {
    const transaction = await db.sequelize.transaction();
    try {
      const user_id = req.user?.user_id;
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
  
      // 연관 데이터 삭제
     // 먼저 댓글 삭제
await db.MyDayComment.destroy({ where: { user_id: user_id }, transaction });

// 게시물과 관련된 상호작용 삭제
await db.MyDayLike.destroy({ where: { user_id: user_id }, transaction });
await db.MyDayEmotion.destroy({ 
  where: { 
    post_id: { 
      [Op.in]: db.sequelize.literal(`(SELECT post_id FROM my_day_posts WHERE user_id = ${user_id})`) 
    } 
  }, 
  transaction 
});

// 그 다음 게시물 삭제
await db.MyDayPost.destroy({ where: { user_id: user_id }, transaction });

// 나머지 연관 데이터 삭제
await Promise.all([
  db.Challenge.destroy({ where: { creator_id: user_id }, transaction }),
  db.ChallengeParticipant.destroy({ where: { user_id: user_id }, transaction }),
  db.EmotionLog.destroy({ where: { user_id: user_id }, transaction }),
  db.SomeoneDayPost.destroy({ where: { user_id: user_id }, transaction }),
  db.SomeoneDayComment.destroy({ where: { user_id: user_id }, transaction }), 
  db.SomeoneDayLike.destroy({ where: { user_id: user_id }, transaction }),
  db.EncouragementMessage.destroy({ where: { sender_id: user_id }, transaction }),
  db.EncouragementMessage.destroy({ where: { receiver_id: user_id }, transaction }),
  db.Notification.destroy({ where: { user_id: user_id }, transaction }),
  db.sequelize.query(
    'DELETE FROM user_stats WHERE user_id = ?',
    {
      replacements: [user_id],
      type: QueryTypes.DELETE,
      transaction
    }
  ),
  db.sequelize.query(
    'DELETE FROM user_goal WHERE user_id = ?',
    {
      replacements: [user_id],
      type: QueryTypes.DELETE,
      transaction
    }
  )
]);
      // 사용자 삭제
      await user.destroy({ transaction });
      await transaction.commit();
  
      return res.json({
        status: 'success',
        message: '회원 탈퇴가 완료되었습니다.'
      });
    } catch (error) {
      await transaction.rollback();
      console.error('회원 탈퇴 오류:', error);
      return res.status(500).json({
        status: 'error',
        message: '서버 오류가 발생했습니다.'
      });
    }
  }

  // 이메일 중복 확인
  async checkEmail(req: Request, res: Response) {
    try {
      const email = req.query.email as string;
      const exists = await db.User.findOne({
        where: { email }
      });
  
      return res.json({
        status: 'success',
        data: { exists: !!exists }
      });
    } catch (error) {
      console.error('이메일 중복 확인 오류:', error);
      return res.status(500).json({
        status: 'error',
        message: '서버 오류가 발생했습니다.'
      });
    }
  }

  // 닉네임 중복 확인
  async checkNickname(req: Request, res: Response) {
    try {
      const nickname = req.query.nickname as string;
      const exists = await db.User.findOne({
        where: { nickname }
      });

      return res.json({
        status: 'success',
        data: { exists: !!exists }
      });
    } catch (error) {
      console.error('닉네임 중복 확인 오류:', error);
      return res.status(500).json({
        status: 'error',
        message: '서버 오류가 발생했습니다.'
      });
    }
}

async blockUser(req: AuthRequest, res: Response) {
  const transaction = await db.sequelize.transaction();
  try {
    const user = req.user;
    if (!user?.user_id) {
      await transaction.rollback();
      return res.status(401).json({
        status: 'error',
        message: '인증이 필요합니다.'
      });
    }

    const { blocked_user_id } = req.body;

    // 차단할 사용자가 존재하는지 확인
    const blockedUser = await db.User.findOne({
      where: { user_id: blocked_user_id },
      transaction
    });

    if (!blockedUser) {
      await transaction.rollback();
      return res.status(404).json({
        status: 'error',
        message: '차단할 사용자를 찾을 수 없습니다.'
      });
    }

    // 이미 차단한 사용자인지 확인
    const existingBlock = await db.UserBlock.findOne({
      where: {
        user_id: user.user_id,
        blocked_user_id
      },
      transaction
    });

    if (existingBlock) {
      await transaction.rollback();
      return res.status(400).json({
        status: 'error',
        message: '이미 차단한 사용자입니다.'
      });
    }

    // 차단 생성
    await db.UserBlock.create({
      user_id: user.user_id,
      blocked_user_id
    }, { transaction });

    await transaction.commit();
    return res.json({
      status: 'success',
      message: '사용자를 차단했습니다.'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('사용자 차단 오류:', error);
    return res.status(500).json({
      status: 'error',
      message: '사용자 차단 중 오류가 발생했습니다.'
    });
  }
}

async unblockUser(req: AuthRequest, res: Response) {
  const transaction = await db.sequelize.transaction();
  try {
    const user = req.user;
    if (!user?.user_id) {
      await transaction.rollback();
      return res.status(401).json({
        status: 'error',
        message: '인증이 필요합니다.'
      });
    }

    const { blocked_user_id } = req.body;

    const result = await db.UserBlock.destroy({
      where: {
        user_id: user.user_id,
        blocked_user_id
      },
      transaction
    });

    if (result === 0) {
      await transaction.rollback();
      return res.status(404).json({
        status: 'error',
        message: '차단하지 않은 사용자입니다.'
      });
    }

    await transaction.commit();
    return res.json({
      status: 'success',
      message: '사용자 차단을 해제했습니다.'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('사용자 차단 해제 오류:', error);
    return res.status(500).json({
      status: 'error',
      message: '사용자 차단 해제 중 오류가 발생했습니다.'
    });
  }
}

async updateNotificationSettings(req: AuthRequest, res: Response) {
  const transaction = await db.sequelize.transaction();
  try {
  const user_id = req.user?.user_id;
  if (!user_id) {
  await transaction.rollback();
  return res.status(401).json({
  status: 'error',
  message: '인증이 필요합니다.'
  });
  }

  const notificationSettings = {
    like_notifications: true,
    comment_notifications: false,
    challenge_notifications: true,
    encouragement_notifications: false
  };
  
  await db.User.update(
    { notification_settings: notificationSettings },
    { 
      where: { user_id },
      transaction
    }
  );
  await transaction.commit();
  return res.json({
    status: 'success',
    message: '알림 설정이 성공적으로 업데이트되었습니다.'
  });
} catch (error) {
  await transaction.rollback();
  console.error('알림 설정 업데이트 오류:', error);
  return res.status(500).json({
  status: 'error',
  message: '알림 설정 업데이트 중 오류가 발생했습니다.'
  });
  }
  }
}


// 인스턴스 생성 및 export
export const userController = new UserController();
// 클래스 export
export { UserController };
// 인터페이스 type export
export type { IUserController };
// default export
export default userController;