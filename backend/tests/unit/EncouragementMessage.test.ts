// tests/unit/EncouragementMessage.test.ts

import { EncouragementMessage } from '../../models/EncouragementMessage';

describe('EncouragementMessage Model', () => {
  describe('toJSON', () => {
    // 익명 메시지가 아닌 경우 테스트
    it('should return all fields for non-anonymous messages', () => {
      // 모델 인스턴스 준비
      const message = new EncouragementMessage();
      
      // 필요한 속성 설정
      Object.defineProperty(message, 'dataValues', {
        value: {
          message_id: 1,
          sender_id: 2,
          receiver_id: 3,
          post_id: 4,
          message: '힘내세요!',
          is_anonymous: false,
          created_at: new Date(),
          sender: { user_id: 2, nickname: '사용자1' }
        },
        writable: true
      });
      
      // toJSON 메서드 실행
      const result = message.toJSON();
      
      // 결과 검증
      expect(result).toHaveProperty('sender_id');
      expect(result).toHaveProperty('sender');
      expect(result.sender_id).toBe(2);
      expect(result.sender).toEqual({ user_id: 2, nickname: '사용자1' });
    });
    
    // 익명 메시지인 경우 테스트
    it('should hide sender info for anonymous messages', () => {
      // 모델 인스턴스 준비
      const message = new EncouragementMessage();
      
      // 필요한 속성 설정
      Object.defineProperty(message, 'dataValues', {
        value: {
          message_id: 1,
          sender_id: 2,
          receiver_id: 3,
          post_id: 4,
          message: '힘내세요!',
          is_anonymous: true,  // 익명 메시지
          created_at: new Date(),
          sender: { user_id: 2, nickname: '사용자1' }
        },
        writable: true
      });
      
      // toJSON 메서드 실행
      const result = message.toJSON();
      
      // 결과 검증
      expect(result).not.toHaveProperty('sender_id');
      expect(result).not.toHaveProperty('sender');
      expect(result).toHaveProperty('message_id');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('is_anonymous');
      expect(result.is_anonymous).toBe(true);
    });
  });
});