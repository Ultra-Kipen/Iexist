// backend/scripts/create-test-user.ts
import db from '../models';
import bcrypt from 'bcryptjs';
import { UserCreationAttributes } from '../models/User';

async function createTestUser() {
  try {
    const existingUser = await db.User.findOne({ where: { email: 'test@example.com' } });
    
    if (existingUser) {
      console.log('테스트 사용자가 이미 존재합니다.');
      return;
    }
    
    const hashedPassword = await bcrypt.hash('Test123!', 10);
    
    // 현재 시간을 생성
    const now = new Date();
    
    const userData: UserCreationAttributes = {
      username: 'testuser',
      email: 'test@example.com',
      password_hash: hashedPassword,
      nickname: '테스트유저',
      is_active: true,
      privacy_settings: {} as any, // 빈 객체를 JSON 타입으로 캐스팅
      notification_settings: {
        like_notifications: true,
        comment_notifications: true,
        challenge_notifications: true,
        encouragement_notifications: true
      },
      created_at: now,   // created_at 필드 추가
      updated_at: now    // updated_at 필드 추가
    };
    
    await db.User.create(userData);
    
    console.log('테스트 사용자가 생성되었습니다.');
  } catch (error) {
    console.error('테스트 사용자 생성 실패:', error);
    if (error instanceof Error) {
      console.error('오류 메시지:', error.message);
      console.error('오류 스택:', error.stack);
    }
  } finally {
    process.exit();
  }
}

createTestUser();