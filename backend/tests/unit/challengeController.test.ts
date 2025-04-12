import { Response } from 'express';
import challengeController from '../../controllers/challengeController';

describe('Challenge Controller Error Handling Tests', () => {
  let mockReq: any;
  let mockRes: Partial<Response>;
  
  // 모킹 설정을 위한 변수들
  let findByPkSpy: jest.SpyInstance;
  let createChallengeSpy: jest.SpyInstance;
  let createParticipantSpy: jest.SpyInstance;
  let findOneChallengeSpy: jest.SpyInstance;
  let findOneChallengeParticipantSpy: jest.SpyInstance;
  let findOneEmotionSpy: jest.SpyInstance;
  let findOneEmotionLogSpy: jest.SpyInstance;
  let createEmotionLogSpy: jest.SpyInstance;
  let destroyParticipantSpy: jest.SpyInstance;
  let findAllSpy: jest.SpyInstance;
  let transactionSpy: jest.SpyInstance;
  let sequelizeQuerySpy: jest.SpyInstance;
  let commitSpy: jest.SpyInstance;
  let rollbackSpy: jest.SpyInstance;
  
  beforeEach(() => {
    // 요청 및 응답 객체 초기화
    mockReq = {
      user: {
        user_id: 1,
        email: 'test@test.com',
        nickname: 'testuser',
        is_active: true
      },
      body: {},
      params: {},
      query: {}
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    // 트랜잭션 객체 모킹
    const mockTransaction = {
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
      finished: false
    };
    commitSpy = jest.spyOn(mockTransaction, 'commit');
    rollbackSpy = jest.spyOn(mockTransaction, 'rollback');
    
    // DB 모듈 모킹
    const mockDb = require('../../models').default;
    
    transactionSpy = jest.spyOn(mockDb.sequelize, 'transaction')
      .mockResolvedValue(mockTransaction);
    
    sequelizeQuerySpy = jest.spyOn(mockDb.sequelize, 'query')
      .mockResolvedValue([]);
    
    // User 모킹
    findByPkSpy = jest.spyOn(mockDb.User, 'findByPk')
      .mockResolvedValue({
        get: jest.fn((key) => key === 'user_id' ? 1 : null)
      });
    
    // Challenge 모킹
    const mockChallenge = {
      get: jest.fn().mockImplementation((key) => {
        if (key === 'challenge_id') return 1;
        if (key === 'creator_id') return 2;
        if (key === 'participant_count') return 5;
        if (key === 'max_participants') return 10;
        if (key === 'title') return '테스트 챌린지';
        if (key === 'description') return '테스트 설명';
        if (key === 'start_date') return new Date('2025-03-22');
        if (key === 'end_date') return new Date('2025-03-29');
        if (key === 'is_public') return true;
        if (key === 'created_at') return new Date();
        return null;
      }),
      increment: jest.fn().mockResolvedValue({}),
      decrement: jest.fn().mockResolvedValue({})
    };
    
    findOneChallengeSpy = jest.spyOn(mockDb.Challenge, 'findOne')
      .mockResolvedValue(mockChallenge);
    
    createChallengeSpy = jest.spyOn(mockDb.Challenge, 'create')
      .mockResolvedValue({
        get: jest.fn((key) => key === 'challenge_id' ? 1 : null)
      });
    
    findAllSpy = jest.spyOn(mockDb.Challenge, 'findAndCountAll')
      .mockResolvedValue({
        count: 10,
        rows: [
          {
            get: jest.fn().mockImplementation((key) => {
              if (key === 'challenge_id') return 1;
              if (key === 'title') return '테스트 챌린지';
              if (key === 'description') return '테스트 설명';
              if (key === 'start_date') return new Date('2025-03-22');
              if (key === 'end_date') return new Date('2025-03-29');
              if (key === 'is_public') return true;
              if (key === 'participant_count') return 5;
              if (key === 'created_at') return new Date();
              if (key === 'challenge_participants') return [
                { user_id: 1, created_at: new Date() }
              ];
              return null;
            })
          }
        ]
      });
    
    // ChallengeParticipant 모킹
    const mockParticipant = {
      user_id: 1,
      challenge_id: 1,
      destroy: jest.fn().mockResolvedValue(true)
    };
    
    findOneChallengeParticipantSpy = jest.spyOn(mockDb.ChallengeParticipant, 'findOne')
      .mockResolvedValue(mockParticipant);
    
    destroyParticipantSpy = jest.spyOn(mockParticipant, 'destroy');
    
    createParticipantSpy = jest.spyOn(mockDb.ChallengeParticipant, 'create')
      .mockResolvedValue({
        get: jest.fn().mockImplementation((key) => {
          if (!key) return { challenge_id: 1, user_id: 1, created_at: new Date() };
          if (key === 'challenge_id') return 1;
          if (key === 'user_id') return 1;
          if (key === 'created_at') return new Date();
          return null;
        })
      });
    
    // Emotion 관련 모킹
    findOneEmotionSpy = jest.spyOn(mockDb.Emotion, 'findOne')
      .mockResolvedValue({
        get: jest.fn().mockReturnValue(1)
      });
    
    findOneEmotionLogSpy = jest.spyOn(mockDb.ChallengeEmotion, 'findOne')
      .mockResolvedValue(null);
    
    createEmotionLogSpy = jest.spyOn(mockDb.ChallengeEmotion, 'create')
      .mockResolvedValue({
        get: jest.fn().mockImplementation((key) => {
          if (!key) return {
            challenge_emotion_id: 1,
            challenge_id: 1,
            user_id: 1,
            emotion_id: 1,
            note: '오늘의 기록',
            log_date: new Date()
          };
          if (key === 'challenge_emotion_id') return 1;
          if (key === 'challenge_id') return 1;
          if (key === 'user_id') return 1;
          if (key === 'emotion_id') return 1;
          if (key === 'note') return '오늘의 기록';
          if (key === 'log_date') return new Date();
          return null;
        })
      });
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  // 테스트 케이스 1: 데이터베이스 오류 처리 (라인 69-71, 91-93 커버)
  describe('Database Error Handling', () => {
    it('should handle database error during challenge creation', async () => {
      // 유효한 요청 본문
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 8);
      
      mockReq.body = {
        title: '테스트 챌린지',
        description: '테스트 설명',
        start_date: tomorrow.toISOString().split('T')[0],
        end_date: nextWeek.toISOString().split('T')[0],
        is_public: true
      };
      
      // DB 오류 시뮬레이션
      createChallengeSpy.mockRejectedValueOnce(new Error('데이터베이스 오류 발생'));
      
      await challengeController.createChallenge(mockReq, mockRes as Response);
      
      expect(rollbackSpy).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        status: 'error',
        message: expect.stringContaining('챌린지 생성 중 오류가 발생했습니다'),
        details: expect.stringContaining('데이터베이스 오류 발생')
      }));
    });
    
    it('should handle database error during challenge participation', async () => {
      mockReq.params = { id: '1' };
      
      // 참가자가 없는 것으로 설정 (findOne 결과 null)
      findOneChallengeParticipantSpy.mockResolvedValueOnce(null);
      
      // DB 오류 시뮬레이션
      createParticipantSpy.mockRejectedValueOnce(new Error('참가자 생성 중 오류 발생'));
      
      await challengeController.participateInChallenge(mockReq, mockRes as Response);
      
      expect(rollbackSpy).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        status: 'error',
        message: expect.stringContaining('챌린지 참가 중 오류가 발생했습니다')
      }));
    });
    
    it('should handle database error during challenge progress update', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = {
        emotion_id: 1,
        progress_note: '오늘의 기록'
      };
      
      // DB 오류 시뮬레이션
      createEmotionLogSpy.mockRejectedValueOnce(new Error('진행 상태 기록 중 오류 발생'));
      
      await challengeController.updateChallengeProgress(mockReq, mockRes as Response);
      
      expect(rollbackSpy).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        status: 'error',
        message: expect.stringContaining('진행 상황 기록 중 오류가 발생했습니다'),
        errorDetails: expect.stringContaining('진행 상태 기록 중 오류 발생')
      }));
    });
  });
  
  // 테스트 케이스 2: 다양한 쿼리 조건 테스트 (라인 110-114, 319-320, 336-337 커버)
  describe('Query Parameter Handling', () => {
    it('should handle sorting by participant_count', async () => {
      mockReq.query = {
        page: '1',
        limit: '10',
        sort_by: 'participant_count',
        order: 'desc'
      };
      
      await challengeController.getChallenges(mockReq, mockRes as Response);
      
      expect(findAllSpy).toHaveBeenCalledWith(expect.objectContaining({
        order: [['participant_count', 'desc'], ['created_at', 'DESC']]
      }));
      expect(mockRes.json).toHaveBeenCalled();
    });
    
    it('should handle sorting by start_date', async () => {
      mockReq.query = {
        page: '1',
        limit: '10',
        sort_by: 'start_date',
        order: 'asc'
      };
      
      await challengeController.getChallenges(mockReq, mockRes as Response);
      
      expect(findAllSpy).toHaveBeenCalledWith(expect.objectContaining({
        order: [['start_date', 'asc'], ['created_at', 'DESC']]
      }));
      expect(mockRes.json).toHaveBeenCalled();
    });
  });
  
  // 테스트 케이스 3: 서버 오류 처리 (라인 250-251, 365-366, 381-384 커버)
  describe('Server Error Handling', () => {
    it('should handle unexpected error during challenge details retrieval', async () => {
      mockReq.params = { id: '1' };
      
      // 예상치 못한 오류 시뮬레이션
      findOneChallengeSpy.mockRejectedValueOnce(new Error('예상치 못한 서버 오류'));
      
      await challengeController.getPostDetails(mockReq, mockRes as Response);
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        status: 'error',
        message: expect.stringContaining('챌린지 상세 정보 조회 중 오류가 발생했습니다')
      }));
    });
    
    it('should handle non-Error object thrown', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = {
        emotion_id: 1,
        progress_note: '오늘의 기록'
      };
      
      // 문자열 오류 시뮬레이션
      createEmotionLogSpy.mockRejectedValueOnce('문자열 형태의 오류');
      
      await challengeController.updateChallengeProgress(mockReq, mockRes as Response);
      
      expect(rollbackSpy).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        status: 'error',
        message: expect.stringContaining('진행 상황 기록 중 오류가 발생했습니다'),
        errorDetails: '알 수 없는 오류'
      }));
    });
  });
  
  // 테스트 케이스 4: 엣지 케이스 처리 (라인 447-449, 478-484, 499 커버)
  describe('Edge Case Handling', () => {
    it('should handle null or undefined in request body', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = {
        emotion_id: 1,
        progress_note: null  // null 값 테스트
      };
      
      await challengeController.updateChallengeProgress(mockReq, mockRes as Response);
      
      expect(createEmotionLogSpy).toHaveBeenCalledWith(expect.objectContaining({
        note: undefined  // null이 undefined로 변환되었는지 확인
      }), expect.anything());
      expect(commitSpy).toHaveBeenCalled();
    });
    
    it('should handle transaction commit error', async () => {
      mockReq.params = { id: '1' };
      
      // 트랜잭션 커밋 오류 시뮬레이션
      commitSpy.mockRejectedValueOnce(new Error('트랜잭션 커밋 오류'));
      
      await challengeController.leaveChallenge(mockReq, mockRes as Response);
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });
  
  // 테스트 케이스 5: 인증 관련 오류 (라인 522-523, 539-540 커버)
  describe('Authentication Error Handling', () => {
    it('should handle missing authentication for getPostDetails', async () => {
      mockReq.user = null;
      mockReq.params = { id: '1' };
      
      await challengeController.getPostDetails(mockReq, mockRes as Response);
      
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        status: 'error',
        message: expect.stringContaining('인증이 필요합니다')
      }));
    });
    
    it('should handle missing authentication for leaveChallenge', async () => {
      mockReq.user = null;
      mockReq.params = { id: '1' };
      
      await challengeController.leaveChallenge(mockReq, mockRes as Response);
      
      expect(rollbackSpy).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        status: 'error',
        message: expect.stringContaining('인증이 필요합니다')
      }));
    });
  });
  
  // 테스트 케이스 6: 날짜 및 시간 테스트 (라인 561-619 커버)
  describe('Date and Time Handling', () => {
    it('should properly format and compare dates', async () => {
      // 오늘 날짜로 감정 로그 생성
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      mockReq.params = { id: '1' };
      mockReq.body = {
        emotion_id: 1,
        progress_note: '오늘의 기록'
      };
      
      // 오늘 이미 로그가 있는 경우 시뮬레이션
      findOneEmotionLogSpy.mockResolvedValueOnce({
        challenge_id: 1,
        user_id: 1,
        emotion_id: 1,
        log_date: today
      });
      
      await challengeController.updateChallengeProgress(mockReq, mockRes as Response);
      
      expect(rollbackSpy).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        status: 'error',
        message: expect.stringContaining('오늘은 이미 진행 상황을 기록했습니다')
      }));
    });
    
    it('should handle date comparison in createChallenge', async () => {
      // 오늘 날짜
      const today = new Date();
      
      // 시작일을 오늘, 종료일을 내일로 설정 (유효한 날짜)
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      mockReq.body = {
        title: '테스트 챌린지',
        description: '테스트 설명',
        start_date: today.toISOString().split('T')[0],
        end_date: tomorrow.toISOString().split('T')[0],
        is_public: true
      };
      
      await challengeController.createChallenge(mockReq, mockRes as Response);
      
      expect(createChallengeSpy).toHaveBeenCalled();
      expect(commitSpy).toHaveBeenCalled();
    });
  });
});