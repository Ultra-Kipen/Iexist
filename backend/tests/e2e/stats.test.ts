import db from '../../models';
import { createTestUser, testRequest } from '../setup';

// 테스트 사용자 정보를 저장할 변수들
let testUser: any;
let token: string;
let userId: number;

// 기본 감정 데이터 초기화 함수
const initializeEmotions = async () => {
  const emotions = [
    { emotion_id: 1, name: '행복', icon: 'emoticon-happy-outline', color: '#FFD700' },
    { emotion_id: 2, name: '감사', icon: 'hand-heart', color: '#FF69B4' },
    { emotion_id: 3, name: '위로', icon: 'hand-peace', color: '#87CEEB' },
    { emotion_id: 4, name: '감동', icon: 'heart-outline', color: '#FF6347' },
    { emotion_id: 5, name: '슬픔', icon: 'emoticon-sad-outline', color: '#4682B4' },
    { emotion_id: 6, name: '불안', icon: 'alert-outline', color: '#DDA0DD' },
    { emotion_id: 7, name: '화남', icon: 'emoticon-angry-outline', color: '#FF4500' },
    { emotion_id: 8, name: '지침', icon: 'emoticon-neutral-outline', color: '#A9A9A9' },
    { emotion_id: 9, name: '우울', icon: 'weather-cloudy', color: '#708090' },
    { emotion_id: 10, name: '고독', icon: 'account-outline', color: '#8B4513' },
    { emotion_id: 11, name: '충격', icon: 'lightning-bolt', color: '#9932CC' },
    { emotion_id: 12, name: '편함', icon: 'sofa-outline', color: '#32CD32' }
  ];

  try {
    // 기존 감정 데이터 확인
    const existingEmotions = await db.Emotion.findAll();
    
    // 감정 테이블이 비어있을 경우에만 데이터 초기화
    if (existingEmotions.length === 0) {
      console.log('감정 데이터 초기화 시작');
      await db.Emotion.bulkCreate(emotions);
      console.log('감정 데이터 초기화 완료');
    } else {
      console.log(`기존 감정 데이터 ${existingEmotions.length}개 사용`);
    }
  } catch (error) {
    console.error('감정 데이터 초기화 실패:', error);
    throw error;
  }
};

// 테스트에 필요한 감정 로그 데이터 생성 함수
// stats.test.ts의 createTestEmotionLogs 함수 수정
const createTestEmotionLogs = async (userId: number) => {
  try {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    // 기존 감정 로그 확인 및 삭제
    try {
      await db.EmotionLog.destroy({
        where: { user_id: userId }
      });
    } catch (err) {
      console.warn('기존 감정 로그 삭제 실패:', err);
    }

    console.log('감정 로그 생성 시작 - 행복 감정');
    // 행복 감정
    try {
      await db.EmotionLog.create({
        user_id: userId,
        emotion_id: 1, // 행복
        note: '오늘은 행복한 하루였어요',
        log_date: today,
        created_at: today,
        updated_at: today
      });
      console.log('행복 감정 로그 생성 완료');
    } catch (err) {
      console.warn('행복 감정 로그 생성 실패:', err);
    }

    console.log('감정 로그 생성 - 감사 감정');
    // 감사 감정
    try {
      await db.EmotionLog.create({
        user_id: userId,
        emotion_id: 2, // 감사
        note: '어제는 감사한 마음이 들었어요',
        log_date: yesterday,
        created_at: today,
        updated_at: today
      });
      console.log('감사 감정 로그 생성 완료');
    } catch (err) {
      console.warn('감사 감정 로그 생성 실패:', err);
    }

    console.log('감정 로그 생성 - 슬픔 감정');
    // 슬픔 감정
    try {
      await db.EmotionLog.create({
        user_id: userId,
        emotion_id: 5, // 슬픔
        note: '지난주에는 슬픈 일이 있었어요',
        log_date: lastWeek,
        created_at: today,
        updated_at: today
      });
      console.log('슬픔 감정 로그 생성 완료');
    } catch (err) {
      console.warn('슬픔 감정 로그 생성 실패:', err);
    }

    console.log('감정 로그 생성 - 감동 감정');
    // 감동 감정
    try {
      await db.EmotionLog.create({
        user_id: userId,
        emotion_id: 4, // 감동
        note: '오늘은 또한 감동적인 일도 있었어요',
        log_date: today,
        created_at: today,
        updated_at: today
      });
      console.log('감동 감정 로그 생성 완료');
    } catch (err) {
      console.warn('감동 감정 로그 생성 실패:', err);
    }

    console.log('감정 로그 생성 완료');
  } catch (error) {
    console.error('감정 로그 생성 오류:', error);
    // 오류가 있어도 테스트 진행을 위해 throw하지 않음
  }
};


describe('통계 API 테스트', () => {
  // 테스트 전에 사용자 생성 및 감정 로그 데이터 준비
  beforeAll(async () => {
    try {
      // 기본 감정 데이터 초기화
      await initializeEmotions();
      
      // 테스트 사용자 생성
      const result = await createTestUser();
      testUser = result.user;
      token = result.token;
      userId = result.userId;
      
      console.log('테스트 토큰:', token);

      // 사용자 통계 정보 확인
      const userStats = await db.UserStats.findOne({
        where: { user_id: userId }
      });

      if (!userStats) {
        // 통계 정보가 없는 경우 생성
        await db.UserStats.create({
          user_id: userId,
          my_day_post_count: 0,
          someone_day_post_count: 0,
          my_day_like_received_count: 0,
          someone_day_like_received_count: 0,
          my_day_comment_received_count: 0,
          someone_day_comment_received_count: 0,
          challenge_count: 0,
          last_updated: new Date()
        });
      }

      // 감정 로그 데이터 생성
      await createTestEmotionLogs(userId);
    } catch (error) {
      console.error('테스트 설정 실패:', error);
      throw error;
    }
  });

  // 테스트 후 정리
  afterAll(async () => {
    try {
      // 생성한 감정 로그 데이터 삭제
      await db.EmotionLog.destroy({
        where: { user_id: userId }
      });

      // 사용자 통계 데이터 삭제
      await db.UserStats.destroy({
        where: { user_id: userId }
      });
      
      // 감정 데이터는 삭제하지 않음 (다른 테스트에서도 사용할 수 있음)
    } catch (error) {
      console.error('테스트 정리 실패:', error);
    }
  });

  // 주요 경로들 확인을 위한 테스트 (개발 중에만 활성화)
  describe('API 경로 확인', () => {
    it('경로 탐색: /', async () => {
      const response = await testRequest.get('/');
      console.log('/ 경로 응답:', response.status, response.body);
    });

    it('경로 탐색: /api', async () => {
      const response = await testRequest.get('/api');
      console.log('/api 경로 응답:', response.status, response.body);
    });

    it('경로 탐색: /api/stats', async () => {
      const response = await testRequest.get('/api/stats');
      console.log('/api/stats 경로 응답:', response.status, response.body);
    });
  });

  // 사용자 통계 조회 테스트
  describe('GET /api/stats - 사용자 통계 조회', () => {
    // 인증이 필요한 엔드포인트 테스트
    it('인증 없이 접근 시 401 에러를 반환해야 함', async () => {
      const response = await testRequest.get('/api/stats');
      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('인증이 필요합니다.');
    });

    it('인증 후 사용자 통계를 성공적으로 조회해야 함', async () => {
      const response = await testRequest
        .get('/api/stats')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeDefined();
      expect(response.body.data.user_id).toBe(userId);
    });
  });

  // 감정 트렌드 조회 테스트
  describe('GET /api/stats/trends - 감정 트렌드 조회', () => {
    it('인증 없이 접근 시 401 에러를 반환해야 함', async () => {
      const response = await testRequest.get('/api/stats/trends');
      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });

    it('인증 후 기본 감정 트렌드를 성공적으로 조회해야 함', async () => {
      const response = await testRequest
        .get('/api/stats/trends')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeDefined();
      expect(response.body.data.trends).toBeDefined();
      expect(response.body.data.period).toBeDefined();
      expect(response.body.data.period.type).toBe('daily');
      expect(Array.isArray(response.body.data.trends)).toBe(true);
    });

    it('날짜 범위를 지정하여 감정 트렌드를 조회할 수 있어야 함', async () => {
      // 일주일 전부터 오늘까지 조회
      const today = new Date();
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);

      const startDate = lastWeek.toISOString().split('T')[0]; // YYYY-MM-DD 형식
      const endDate = today.toISOString().split('T')[0];

      const response = await testRequest
        .get(`/api/stats/trends?start_date=${startDate}&end_date=${endDate}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.trends).toBeDefined();
      expect(response.body.data.period.start_date).toBeDefined();
      expect(response.body.data.period.end_date).toBeDefined();
    });
  });

  // 주간 트렌드 조회 테스트
  describe('GET /api/stats/weekly - 주간 감정 트렌드 조회', () => {
    it('인증 후 주간 감정 트렌드를 성공적으로 조회해야 함', async () => {
      const response = await testRequest
        .get('/api/stats/weekly')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.period.type).toBe('weekly');
    });
  });

  // 월간 트렌드 조회 테스트
  describe('GET /api/stats/monthly - 월간 감정 트렌드 조회', () => {
    it('인증 후 월간 감정 트렌드를 성공적으로 조회해야 함', async () => {
      const response = await testRequest
        .get('/api/stats/monthly')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.period.type).toBe('monthly');
    });
  });

  // 잘못된 요청 테스트
  describe('잘못된 요청 처리', () => {
    it('잘못된 날짜 형식으로 요청 시 400 에러를 반환해야 함', async () => {
      const response = await testRequest
        .get('/api/stats/trends?start_date=invalid-date&end_date=2025-01-01')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
  });
});