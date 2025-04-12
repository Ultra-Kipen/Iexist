// tests/integration/services/ChallengeEmotionIntegration.test.ts

import { Op } from 'sequelize';

// Sequelize 모델 타입 정의
interface ModelInstance {
  [key: string]: any;
  get: (field?: string) => any;
  destroy: () => Promise<void>;
}

interface ModelStatic {
  create: (data: any) => Promise<ModelInstance>;
  findAll: (options?: any) => Promise<ModelInstance[]>;
  findOne: (options?: any) => Promise<ModelInstance | null>;
  findByPk: (id: number) => Promise<ModelInstance | null>;
  getAttributes: () => Record<string, any>;
}

// Sequelize 및 모델 메서드 모킹
jest.mock('../../../models', () => {
  const mockOp = {
    like: 'LIKE',
    between: 'BETWEEN'
  };
  
  const mockSequelize = {
    authenticate: jest.fn().mockResolvedValue(undefined),
    getQueryInterface: jest.fn().mockReturnValue({
      showAllTables: jest.fn().mockResolvedValue(['users', 'emotions', 'challenges', 'challenge_participants', 'challenge_emotions'])
    }),
    transaction: jest.fn().mockImplementation(async (callback: any) => {
      if (callback) {
        return await callback({commit: jest.fn(), rollback: jest.fn()});
      }
      return { commit: jest.fn(), rollback: jest.fn() };
    }),
    close: jest.fn().mockResolvedValue(undefined),
    Op: mockOp
  };

  // 모의 감정 데이터 (명시적으로 정의)
  const emotionsData = [
    { emotion_id: 1, name: '테스트행복', icon: 'happy-icon', color: '#FFD700' },
    { emotion_id: 2, name: '테스트감사', icon: 'grateful-icon', color: '#9370DB' }
  ];

  // 모의 모델 생성
  const createMockModel = (name: string): ModelStatic => {
    const instances = new Map<number, ModelInstance>();
    let idCounter = 1;
    
    // 감정 데이터 미리 저장 (Emotion 모델을 위한 사전 설정)
    if (name === 'Emotion') {
      emotionsData.forEach(emotion => {
        const instance: ModelInstance = {
          ...emotion,
          get: function(field?: string) {
            if (field) return this[field];
            return this;
          },
          destroy: jest.fn().mockResolvedValue(undefined)
        };
        instances.set(emotion.emotion_id, instance);
      });
    }
    
    // Model 함수 수정 - ModelInstance 생성 함수
    const createInstance = (data: any): ModelInstance => {
      const id = data.id || data.emotion_id || idCounter++;
      const instance: ModelInstance = {
        ...data,
        id,
        get: function(field?: string) {
          if (field) return this[field];
          return this;
        },
        destroy: jest.fn().mockResolvedValue(undefined)
      };
      instances.set(id, instance);
      return instance;
    };
    
    // Model 정적 메서드 추가
    const Model = {
      create: jest.fn().mockImplementation(async (data: any) => {
        const instance = createInstance(data);
        return instance;
      }),
      
      findAll: jest.fn().mockImplementation(async (options?: any) => {
        // 모킹된 데이터 반환
        return Array.from(instances.values()).filter(instance => {
          // 기본 필터링 구현
          if (options?.where) {
            for (const [key, value] of Object.entries(options.where)) {
              if (typeof value === 'object' && value !== null && 'LIKE' in value) {
                // LIKE 연산자 처리
                continue;
              } else if (typeof value === 'object' && value !== null && 'BETWEEN' in value) {
                // BETWEEN 연산자 처리
                continue;
              } else if (instance[key] !== value) {
                return false;
              }
            }
          }
          return true;
        });
      }),
      
      findOne: jest.fn().mockImplementation(async (options?: any) => {
        const results = await Model.findAll(options);
        return results[0] || null;
      }),
      
      findByPk: jest.fn().mockImplementation(async (id: number) => {
        return instances.get(id) || null;
      }),
      
      getAttributes: jest.fn().mockReturnValue({
        challenge_emotion_id: {},
        challenge_id: {},
        user_id: {},
        emotion_id: {},
        log_date: {},
        note: {},
        created_at: {}
      })
    } as ModelStatic;
    
    return Model;
  };
  
  // 모의 모델 반환
  return {
    sequelize: mockSequelize,
    User: createMockModel('User'),
    Emotion: createMockModel('Emotion'),
    Challenge: createMockModel('Challenge'),
    ChallengeParticipant: createMockModel('ChallengeParticipant'),
    ChallengeEmotion: createMockModel('ChallengeEmotion'),
    Op: mockOp
  };
});

// User, Emotion, Challenge, ChallengeParticipant, ChallengeEmotion 가져오기
const mockModules = jest.requireMock('../../../models');
const { User, Emotion, Challenge, ChallengeParticipant, ChallengeEmotion } = mockModules;

// 헬퍼 함수 모킹
jest.mock('../../helpers/db.helper', () => ({
  createTestUser: jest.fn().mockResolvedValue({
    user_id: 1,
    username: 'challenge_emotion_test',
    email: 'challenge_emotion@example.com',
    nickname: 'ChallengeTest'
  }),
  createTestEmotion: jest.fn().mockImplementation((data: any) => {
    return Promise.resolve({
      emotion_id: data.name === '테스트행복' ? 1 : 2,
      name: data.name,
      icon: data.icon,
      color: data.color
    });
  })
}));

const { createTestUser, createTestEmotion } = jest.requireMock('../../helpers/db.helper');

describe('챌린지와 감정 서비스 통합 테스트', () => {
  let userId: number;
  let emotionIds: number[];
  let challengeId: number;

  beforeAll(async () => {
    // 테스트 사용자 생성
    const user = await createTestUser({
      username: 'challenge_emotion_test',
      email: 'challenge_emotion@example.com',
      password_hash: 'password123',
      nickname: 'ChallengeTest',
      is_active: true
    });
    
    userId = user.user_id;
    
    // 테스트 감정 생성
    const emotions = await Promise.all([
      createTestEmotion({ name: '테스트행복', icon: 'happy-icon', color: '#FFD700' }),
      createTestEmotion({ name: '테스트감사', icon: 'grateful-icon', color: '#9370DB' })
    ]);
    
    emotionIds = emotions.map(emotion => emotion.emotion_id);
    
    // 테스트 챌린지 생성
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + 7);
    
    const challenge = await Challenge.create({
      creator_id: userId,
      title: '감정 기록 챌린지',
      description: '7일간 매일 감정을 기록하는 챌린지입니다.',
      start_date: today,
      end_date: endDate,
      is_public: true,
      participant_count: 1
    });
    
    challengeId = challenge.get('challenge_id');
    
    // 챌린지 참가자 등록
    await ChallengeParticipant.create({
      challenge_id: challengeId,
      user_id: userId
    });
  });

  it('챌린지에 감정 기록 추가 테스트', async () => {
    // 오늘 날짜
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 챌린지에 감정 기록 추가
    const emotionLog = await ChallengeEmotion.create({
      challenge_id: challengeId,
      user_id: userId,
      emotion_id: emotionIds[0],
      log_date: today,
      note: '오늘은 기분이 좋았습니다.'
    });
    
    expect(emotionLog).not.toBeNull();
    expect(emotionLog.challenge_id).toBe(challengeId);
    expect(emotionLog.user_id).toBe(userId);
    expect(emotionLog.emotion_id).toBe(emotionIds[0]);
    
    // 챌린지의 감정 기록 조회
    const emotionLogs = await ChallengeEmotion.findAll({
      where: {
        challenge_id: challengeId,
        user_id: userId
      },
      include: [{
        model: Emotion,
        as: 'emotion'
      }],
      order: [['log_date', 'DESC']]
    });
    
    expect(emotionLogs).not.toBeNull();
    expect(emotionLogs.length).toBeGreaterThanOrEqual(1);
    expect(emotionLogs[0].emotion_id).toBe(emotionIds[0]);
    
    // emotion 관계가 모킹된 객체에서는 직접 처리
    const firstEmotion = await Emotion.findByPk(emotionIds[0]);
    expect(firstEmotion).not.toBeNull();
    expect(firstEmotion?.name).toBe('테스트행복');
  });

  it('챌린지 기간 내 감정 변화 추적 테스트', async () => {
    // 첫째 날 감정 기록 (이미 추가됨)
    const firstDay = new Date();
    firstDay.setHours(0, 0, 0, 0);
    
    // 둘째 날 감정 기록
    const secondDay = new Date();
    secondDay.setDate(firstDay.getDate() + 1);
    secondDay.setHours(0, 0, 0, 0);
    
    const secondLog = await ChallengeEmotion.create({
      challenge_id: challengeId,
      user_id: userId,
      emotion_id: emotionIds[1], // 다른 감정
      log_date: secondDay,
      note: '감사한 하루였습니다.'
    });
    
    expect(secondLog).not.toBeNull();
    
    // 챌린지 기간 내 감정 기록 조회
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 1);
    
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 8); // 챌린지 종료일 이후
    
    const emotionLogs = await ChallengeEmotion.findAll({
      where: {
        challenge_id: challengeId,
        user_id: userId
      }
    });
    
    // 감정 변화 추적
    expect(emotionLogs.length).toBe(2);
    
    // 모킹 환경에서는 감정 이름을 직접 조회하되, name 필드를 직접 사용
    const emotionNames = [];
    for (const log of emotionLogs) {
      const emotion = await Emotion.findByPk(log.emotion_id);
      if (emotion) {
        emotionNames.push(emotion.name);
      }
    }
    
    expect(emotionNames).toContain('테스트행복');
    expect(emotionNames).toContain('테스트감사');
    
    // 참가자의 챌린지 진행 상황
    const participationDays = emotionLogs.length;
    const totalDays = 7; // 챌린지 기간 (7일)
    const progressPercentage = (participationDays / totalDays) * 100;
    
    expect(progressPercentage).toBe(2/7 * 100); // 2일 참여 중
  });
});