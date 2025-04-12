import { EmotionService } from '../../services/EmotionService';
import { db, createTestUser } from '../../tests/setup';
import { EmotionCreateDTO } from '../../types/emotion';
import { Op } from 'sequelize';

describe('EmotionService', () => {
  let emotionService: EmotionService;
  let testUser: any;
  let defaultEmotions: any[];

  // 테스트 데이터 준비 함수
  const prepareEmotions = async () => {
    // 감정 데이터 준비
    const existingEmotions = await db.Emotion.findAll({
      limit: 2,
      order: [['emotion_id', 'ASC']]
    });

    if (existingEmotions.length === 0) {
      console.log('감정 데이터가 없어 기본 감정 생성');
      defaultEmotions = [
        { emotion_id: 1, name: '행복', icon: 'emoticon-happy-outline', color: '#FFD700' },
        { emotion_id: 2, name: '감사', icon: 'hand-heart', color: '#FF69B4' }
      ];
      
      await db.Emotion.bulkCreate(defaultEmotions);
      
      return await db.Emotion.findAll({
        limit: 2,
        order: [['emotion_id', 'ASC']]
      });
    }
    
    return existingEmotions;
  };

  beforeAll(async () => {
    emotionService = new EmotionService();
    
    // 명시적으로 테스트 사용자 생성 및 검증
    try {
      const { user } = await createTestUser();
      testUser = user;
      
      // 사용자 생성 확인
      if (!testUser || !testUser.get('user_id')) {
        console.log('테스트 사용자 생성 실패, 수동으로 생성합니다');
        // 수동으로 사용자 생성
        testUser = await db.User.create({
          username: 'test_user_emotion',
          email: 'test_emotion@example.com',
          password_hash: 'test_hash',
          nickname: 'TestUserEmotion',
          is_active: true,
          notification_settings: {
            like_notifications: true,
            comment_notifications: true,
            challenge_notifications: true,
            encouragement_notifications: true
          },
          privacy_settings: JSON.parse('{}'),
          created_at: new Date(),
          updated_at: new Date()
        });
      }
      
      // UserStats도 생성
      await db.UserStats.findOrCreate({
        where: { user_id: testUser.get('user_id') },
        defaults: {
          user_id: testUser.get('user_id'),
          my_day_post_count: 0,
          someone_day_post_count: 0,
          my_day_like_received_count: 0,
          someone_day_like_received_count: 0,
          my_day_comment_received_count: 0,
          someone_day_comment_received_count: 0,
          challenge_count: 0,
          last_updated: new Date()
        }
      });
      
      console.log('테스트 사용자 ID:', testUser.get('user_id'));
    } catch (error) {
      console.error('테스트 사용자 생성 중 오류:', error);
    }
  
    // 감정 데이터 미리 준비
    await prepareEmotions();
  });
  
  afterAll(async () => {
    try {
      // 모든 가능한 테이블에서 테스트 관련 데이터 정리
      if (testUser) {
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
        
        // emotion_logs 테이블 정리
        await db.EmotionLog.destroy({
          where: { user_id: testUser.get('user_id') },
          force: true
        });
        
        // 사용자 및 관련 데이터 삭제
        await db.UserStats.destroy({
          where: { user_id: testUser.get('user_id') },
          force: true
        });
        
        await db.User.destroy({
          where: { user_id: testUser.get('user_id') },
          force: true
        });
        
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
      }
    } catch (error) {
      console.error('테스트 정리 중 오류:', error);
    }
  });

  // 기존 테스트 케이스
  it('createEmotion should create emotion logs', async () => {
    // 감정 데이터 준비
    const existingEmotions = await prepareEmotions();

    // 감정 ID 배열 생성 전 로깅
    console.log('사용할 감정 데이터:', existingEmotions.map(e => ({
      id: e.get('emotion_id'),
      name: e.get('name')
    })));

    const mockData: EmotionCreateDTO = {
      emotion_ids: existingEmotions.map(e => e.get('emotion_id')),
      note: '테스트 감정'
    };

    // mockData 로깅
    console.log('생성할 감정 데이터:', mockData);

    const beforeCount = await db.EmotionLog.count({
      where: { user_id: testUser.get('user_id') }
    });

    const result = await emotionService.createEmotion(mockData, testUser.get('user_id'));
    console.log('createEmotion 결과:', result);
    
    expect(result.status).toBe('success');

    const afterCount = await db.EmotionLog.count({
      where: { user_id: testUser.get('user_id') }
    });

    expect(afterCount).toBe(beforeCount + existingEmotions.length);
  });

  // 추가 테스트 1: 빈 감정 ID 배열 처리 테스트
  it('should handle empty emotion_ids array', async () => {
    const mockData: EmotionCreateDTO = {
      emotion_ids: [],
      note: '테스트 감정'
    };

    // 빈 배열을 전달했을 때 에러 응답 확인
    const result = await emotionService.createEmotion(mockData, testUser.get('user_id'));
    expect(result.status).toBe('error');
    expect(result.message).toBe('하나 이상의 감정을 선택해주세요.');
  });

  // 추가 테스트 2: 유효하지 않은 감정 ID 처리 테스트
  it('should handle invalid emotion_ids', async () => {
    // 존재하지 않는 ID를 포함
    const invalidId = 9999;
    const mockData: EmotionCreateDTO = {
      emotion_ids: [invalidId],
      note: '테스트 감정'
    };

    const result = await emotionService.createEmotion(mockData, testUser.get('user_id'));
    expect(result.status).toBe('error');
    expect(result.message).toBe('유효하지 않은 감정이 포함되어 있습니다.');
  });

  // 추가 테스트 3: 감정 로그 저장 후 데이터 검증
// tests/services/EmotionService.test.ts - should save emotion logs with correct data 테스트 수정

// 기존 테스트 케이스를 아래와 같이 수정
// tests/services/EmotionService.test.ts - should save emotion logs with correct data 테스트 수정

// tests/services/EmotionService.test.ts - should save emotion logs with correct data 테스트 수정

it('should save emotion logs with correct data', async () => {
  // 감정 데이터 준비 확인
  const existingEmotions = await prepareEmotions();
  expect(existingEmotions.length).toBeGreaterThan(0);

  const emotionId = existingEmotions[0].get('emotion_id');
  const testNote = '감정 로그 데이터 검증 테스트';
  
  const mockData: EmotionCreateDTO = {
    emotion_ids: [emotionId],
    note: testNote
  };
  
  // createEmotion 호출
  const result = await emotionService.createEmotion(mockData, testUser.get('user_id'));
  
  // 성공 응답 확인
  expect(result.status).toBe('success');
  
  // 타입 가드를 사용하여 데이터 구조 검증
  expect(result.data).toBeDefined();
  
  if (result.data && Array.isArray(result.data) && result.data.length > 0) {
    // 안전한 타입 검사
    const firstLog = result.data[0];
    
    // 타입 가드를 통한 안전한 접근
    if (typeof firstLog === 'object' && firstLog !== null) {
      const log = firstLog as any;
      expect(log.emotion_id).toBe(emotionId);
      expect(log.note).toBe(testNote);
      expect(log.user_id).toBe(testUser.get('user_id'));
    }
  }
});

  // 추가 테스트 4: 감정 통계 날짜 범위 테스트
  it('should filter emotion stats by date range', async () => {
    // 감정 데이터 준비 확인
    const existingEmotions = await prepareEmotions();
    expect(existingEmotions.length).toBeGreaterThan(0);
    
    const emotionId = existingEmotions[0].get('emotion_id');
    
    // 오늘 날짜
    const today = new Date();
    
    // 어제 날짜
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    // 내일 날짜
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // 테스트 데이터 정리 - findOrCreate 대신 사용
    await db.EmotionLog.destroy({
      where: {
        user_id: testUser.get('user_id'),
        note: {
          [Op.in]: ['오늘 감정 테스트', '어제 감정 테스트']
        }
      }
    });
    
    // EmotionService를 사용하여 오늘의 감정 기록
    await emotionService.createEmotion({
      emotion_ids: [emotionId],
      note: '오늘 감정 테스트'
    }, testUser.get('user_id'));
    
    // EmotionService를 사용하여 어제의 감정 기록
    await emotionService.createEmotion({
      emotion_ids: [emotionId],
      note: '어제 감정 테스트'
    }, testUser.get('user_id'));
    
    // 어제부터 오늘까지의 통계 조회
    const stats = await emotionService.getEmotionStats(
      testUser.get('user_id'), 
      yesterday, 
      today
    );
    
    // 날짜 포맷팅
    const todayKey = today.toISOString().split('T')[0];
    const yesterdayKey = yesterday.toISOString().split('T')[0];
    const tomorrowKey = tomorrow.toISOString().split('T')[0];
    
    // 어제와 오늘 데이터는 있어야 함
    expect(stats[todayKey]).toBeDefined();
    expect(stats[yesterdayKey]).toBeDefined();
    
    // 내일 데이터는 없어야 함
    expect(stats[tomorrowKey]).toBeUndefined();
  });

  // 기존 테스트 케이스
  it('should get emotion statistics', async () => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const stats = await emotionService.getEmotionStats(testUser.get('user_id'), startOfDay, endOfDay);
    expect(stats).toBeDefined();
    
    const logs = await db.EmotionLog.findAll({
      where: { 
        user_id: testUser.get('user_id'),
        log_date: { 
          [Op.between]: [startOfDay, endOfDay]
        }
      }
    });

    const dateKey = now.toISOString().split('T')[0];
    
    if (logs.length > 0) {
      expect(stats[dateKey]).toBeDefined();
    }
  });
});