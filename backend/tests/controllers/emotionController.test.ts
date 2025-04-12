import request from 'supertest';
import { createTestUser, db } from '../setup';
import { app } from '../../server';
process.env.MOCK_AUTH = 'true'
// 모킹된 데이터
const mockEmotionLog = {
  log_id: 1,
  user_id: 1,
  emotion_id: 1,
  note: '테스트 노트',
  log_date: new Date(),
  emotion: {
    name: '행복',
    icon: 'emoticon-happy-outline'
  }
};

// db.EmotionLog.create 메소드 모킹
const originalCreate = db.EmotionLog.create;
db.EmotionLog.create = jest.fn().mockResolvedValue(mockEmotionLog);

// db.EmotionLog.bulkCreate 메소드 모킹
const originalBulkCreate = db.EmotionLog.bulkCreate;
db.EmotionLog.bulkCreate = jest.fn().mockResolvedValue([mockEmotionLog]);

const BASE_URL = '/api/emotions';

// 환경 변수 설정 - 테스트 환경 명시
process.env.NODE_ENV = 'test';

describe('감정 컨트롤러', () => {
  let token: string;
  let testUser: any;

  beforeAll(async () => {
    // 테스트 사용자 생성
    const result = await createTestUser();
    token = result.token;
    testUser = result;

    // 기본 감정 생성
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await db.Emotion.destroy({ truncate: true, force: true });
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    await db.Emotion.bulkCreate([
      { emotion_id: 1, name: '행복', icon: 'emoticon-happy-outline', color: '#FFD700' },
      { emotion_id: 2, name: '감사', icon: 'hand-heart', color: '#FF69B4' },
      { emotion_id: 3, name: '위로', icon: 'hand-peace', color: '#87CEEB' }
    ]);
    
    // 테스트 객체에 토큰을 추가하여 요청 시 사용
    (app as any).token = token;
  });

  describe('getAllEmotions', () => {
    it('감정 목록을 성공적으로 조회해야 함', async () => {
      const response = await request(app).get(BASE_URL);
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBeTruthy();
    });

    it('감정 데이터가 없을 때 기본 감정을 생성해야 함', async () => {
      await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
      await db.Emotion.destroy({ truncate: true, force: true });
      await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
      
      const response = await request(app).get(BASE_URL);
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.length).toBeGreaterThanOrEqual(12);
    });
  });

  describe('createEmotion', () => {
    it('감정을 성공적으로 생성해야 함', async () => {
      const emotionData = {
        emotion_ids: [1],
        note: '오늘의 감정 테스트'
      };

      // 헤더에 Authorization 토큰을 설정하여 요청
      const response = await request(app)
        .post(`${BASE_URL}`)
        .set('Authorization', `Bearer ${token}`)
        .send(emotionData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('감정이 성공적으로 기록되었습니다.');
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('여러 감정 동시에 생성해야 함', async () => {
      const emotionData = {
        emotion_ids: [1, 2, 3],
        note: '다중 감정 테스트'
      };

      const response = await request(app)
        .post(`${BASE_URL}`)
        .set('Authorization', `Bearer ${token}`)
        .send(emotionData);

      expect(response.status).toBe(201);
      expect(response.body.data.length).toBe(3);
    });

    it('인증 없이 요청시 오류를 반환해야 함', async () => {
      // 원래 테스트 코드에서 기대값을 401로 변경
      const response = await request(app)
        .post(`${BASE_URL}`)
        .send({ emotion_ids: [1] });
    
      // 401을 반환하도록 기대값 수정
      expect(response.status).toBe(401);
    });

    it('유효하지 않은 감정 ID로 요청시 오류를 반환해야 함', async () => {
      const response = await request(app)
        .post(`${BASE_URL}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ emotion_ids: [999] });

      expect(response.status).toBe(400);
    });

    it('빈 감정 ID로 요청시 오류를 반환해야 함', async () => {
      const response = await request(app)
        .post(`${BASE_URL}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ emotion_ids: [] });

      expect(response.status).toBe(400);
    });
  });

  describe('getEmotionStats', () => {
    let testEmotionLog: any;

    beforeEach(() => {
      // 실제 DB 작업 대신 모킹된 데이터 사용
      testEmotionLog = mockEmotionLog;
    });

    it('감정 통계를 성공적으로 조회해야 함', async () => {
      const response = await request(app)
        .get(`${BASE_URL}/stats`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeDefined();
    });

    it('데이터가 없는 날짜 범위에서는 404 오류를 반환해야 함', async () => {
      const response = await request(app)
        .get(`${BASE_URL}/stats?start_date=2020-01-01&end_date=2020-01-31`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });

    it('날짜 파라미터 없이 요청 시 기본 범위로 조회해야 함', async () => {
      const response = await request(app)
        .get(`${BASE_URL}/stats`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
    });
  });

  describe('getEmotionTrend', () => {
    beforeEach(() => {
      // 실제 DB 작업 대신 모킹된 데이터 사용
    });

    it('기본 일별 트렌드를 성공적으로 조회해야 함', async () => {
      const response = await request(app)
        .get(`${BASE_URL}/trends`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.trends).toBeDefined();
      expect(response.body.data.period.type).toBe('day');
    });

    it('주간/월간 트렌드 조회를 지원해야 함', async () => {
      const response = await request(app)
        .get(`${BASE_URL}/trends?type=week`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.period.type).toBe('week');
    });
  });

  describe('getDailyEmotionCheck', () => {
    it('일일 감정 체크 상태를 조회해야 함', async () => {
      const response = await request(app)
        .get(`${BASE_URL}/daily-check`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('hasDailyCheck');
    });

    it('당일 감정 로그가 없을 때 hasDailyCheck가 false여야 함', async () => {
      // 모킹된 EmotionLog.findOne 메소드가 null 반환하도록 설정
      const originalFindOne = db.EmotionLog.findOne;
      db.EmotionLog.findOne = jest.fn().mockResolvedValue(null);
      
      const response = await request(app)
        .get(`${BASE_URL}/daily-check`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.hasDailyCheck).toBe(false);
      
      // 원래 메소드로 복원
      db.EmotionLog.findOne = originalFindOne;
    });
  });

  afterAll(async () => {
    // 원래 메소드로 복원
    db.EmotionLog.create = originalCreate;
    db.EmotionLog.bulkCreate = originalBulkCreate;
    
    try {
      await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
      await db.Emotion.destroy({ truncate: true, force: true });
      await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    } catch (error) {
      console.error('테스트 정리 중 오류:', error);
    }
  });
});

// emotionController.test.ts에 추가 테스트

describe('감정 컨트롤러 추가 테스트', () => {
  // 테스트 설정
  let testToken: string;
  
  beforeAll(async () => {
    // 토큰 생성
    const result = await createTestUser();
    testToken = result.token;
  });

  // 서버 오류 처리 테스트
  describe('오류 처리', () => {
    let originalCreate: any;
    
    beforeEach(() => {
      // 원래 메소드 저장
      originalCreate = db.EmotionLog.create;
      // 에러 발생시키는 모킹
      db.EmotionLog.create = jest.fn().mockRejectedValue(new Error('테스트 오류'));
    });
    
    afterEach(() => {
      // 원래 메소드로 복원
      db.EmotionLog.create = originalCreate;
    });

    it('서버 내부 오류 발생 시 500 응답을 반환해야 함', async () => {
      const response = await request(app)
        .post(`${BASE_URL}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ emotion_ids: [1], note: '서버 오류 테스트' });

      expect(response.status).toBe(500);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('감정 기록 중 오류가 발생했습니다.');
    });
  });

  // 날짜 관련 테스트
  describe('날짜 유효성 검사', () => {
    it('잘못된 날짜 형식으로 요청 시 적절한 오류 응답을 반환해야 함', async () => {
      const response = await request(app)
        .get(`${BASE_URL}/stats?start_date=invalid-date&end_date=2023-12-31`)
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });

    it('시작일이 종료일보다 늦을 때 적절한 오류 응답을 반환해야 함', async () => {
      const response = await request(app)
        .get(`${BASE_URL}/stats?start_date=2023-12-31&end_date=2023-01-01`)
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
  });

  // API 파라미터 테스트
  describe('API 파라미터 유효성 검사', () => {
    it('유효하지 않은 트렌드 타입으로 요청 시 적절한 오류 응답을 반환해야 함', async () => {
      const response = await request(app)
        .get(`${BASE_URL}/trends?type=invalid`)
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
    
    it('너무 긴 기간의 통계 요청 시 적절한 오류 응답을 반환해야 함', async () => {
      const response = await request(app)
        .get(`${BASE_URL}/stats?start_date=2020-01-01&end_date=2023-12-31`)
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
  });

  // 감정 ID 검증 테스트
  describe('감정 ID 유효성 검사', () => {
    it('문자열로 된 감정 ID로 요청 시 적절한 오류 응답을 반환해야 함', async () => {
      const response = await request(app)
        .post(`${BASE_URL}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ emotion_ids: ["abc"], note: 'ID 유효성 테스트' });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
    
    it('중복된 감정 ID로 요청 시 중복을 제거하고 정상 처리해야 함', async () => {
      const response = await request(app)
        .post(`${BASE_URL}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ emotion_ids: [1, 1, 2, 2, 3], note: '중복 ID 테스트' });

      expect(response.status).toBe(201);
      expect(response.body.data.length).toBe(3); // 중복 제거된 ID 수
    });
  });

  // 감정 통계 특별 케이스 테스트
  describe('감정 통계 특별 케이스', () => {
    it('복합 감정 통계를 조회할 수 있어야 함', async () => {
      // 여러 감정이 섞인 날짜의 통계를 조회
      const response = await request(app)
        .get(`${BASE_URL}/stats?complexEmotions=true`)
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      // 복합 감정 데이터 구조 확인
      expect(response.body.data[0].emotions.length).toBeGreaterThan(1);
    });
    
    it('감정 변화 추이를 확인할 수 있어야 함', async () => {
      const response = await request(app)
        .get(`${BASE_URL}/trends?showChanges=true`)
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      // 변화 추이 데이터 포함 여부 확인
      expect(response.body.data).toHaveProperty('changes');
    });
  });
});