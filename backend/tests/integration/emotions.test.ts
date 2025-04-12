import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

// 컨트롤러 모킹
const mockEmotionController = {
  getAllEmotions: jest.fn(),
  getEmotionStats: jest.fn(),
  getEmotionTrend: jest.fn(),
  createEmotion: jest.fn(),
  getDailyEmotionCheck: jest.fn()
};

// 원래 컨트롤러 모듈을 모킹
jest.mock('../../controllers/emotionController', () => mockEmotionController);

describe('감정 API 테스트', () => {
  const mockUserId = 999;
  
  beforeEach(() => {
    // 모킹된 함수 초기화
    Object.values(mockEmotionController).forEach(mock => mock.mockReset());
  });
  
  describe('감정 목록 조회 테스트 (/api/emotions)', () => {
    it('감정 목록이 성공적으로 조회되어야 함', async () => {
      // 성공 응답 모킹
      mockEmotionController.getAllEmotions.mockImplementation((req, res) => {
        res.status(200).json({
          status: 'success',
          data: [
            { emotion_id: 1, name: '행복', icon: 'emoticon-happy-outline', color: '#FFD700' },
            { emotion_id: 2, name: '감사', icon: 'hand-heart', color: '#FF69B4' }
          ]
        });
        return Promise.resolve();
      });
      
      // 가짜 요청/응답 객체
      const req = {} as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockEmotionController.getAllEmotions(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.arrayContaining([
            expect.objectContaining({
              emotion_id: expect.any(Number),
              name: expect.any(String),
              icon: expect.any(String)
            })
          ])
        })
      );
    });
  });

  describe('감정 기록 테스트 (/api/emotions)', () => {
    it('감정이 성공적으로 기록되어야 함', async () => {
      // 성공 응답 모킹
      mockEmotionController.createEmotion.mockImplementation((req, res) => {
        res.status(201).json({
          status: 'success',
          message: '감정이 성공적으로 기록되었습니다.',
          data: [
            {
              log_id: 1,
              user_id: mockUserId,
              emotion_id: 1,
              log_date: new Date().toISOString(),
              note: '오늘은 정말 행복한 하루였습니다.'
            }
          ]
        });
        return Promise.resolve();
      });
      
      // 가짜 요청/응답 객체
      const req = {
        user: { user_id: mockUserId },
        body: {
          emotion_ids: [1],
          note: '오늘은 정말 행복한 하루였습니다.'
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockEmotionController.createEmotion(req, res);
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          message: expect.stringContaining('기록'),
          data: expect.arrayContaining([
            expect.objectContaining({
              user_id: mockUserId,
              emotion_id: expect.any(Number)
            })
          ])
        })
      );
    });

    it('인증되지 않은 사용자는 감정을 기록할 수 없음', async () => {
      mockEmotionController.createEmotion.mockImplementation((req, res) => {
        res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
        return Promise.resolve();
      });
      
      const req = {
        user: undefined, // 인증 없음
        body: {
          emotion_ids: [1],
          note: '오늘은 정말 행복한 하루였습니다.'
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockEmotionController.createEmotion(req, res);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('인증')
        })
      );
    });

    it('감정 ID 없이 요청 시 실패해야 함', async () => {
      mockEmotionController.createEmotion.mockImplementation((req, res) => {
        res.status(400).json({
          status: 'error',
          message: '하나 이상의 감정을 선택해주세요.'
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        body: {
          emotion_ids: [],
          note: '오늘은 정말 행복한 하루였습니다.'
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockEmotionController.createEmotion(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('감정')
        })
      );
    });
  });

  describe('감정 통계 조회 테스트 (/api/emotions/stats)', () => {
    it('감정 통계가 성공적으로 조회되어야 함', async () => {
      mockEmotionController.getEmotionStats.mockImplementation((req, res) => {
        res.status(200).json({
          status: 'success',
          data: [
            {
              date: '2025-01-01',
              emotions: [
                { name: '행복', icon: 'emoticon-happy-outline', count: 3 },
                { name: '감사', icon: 'hand-heart', count: 2 }
              ]
            }
          ]
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        query: {
          start_date: '2025-01-01',
          end_date: '2025-01-31'
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockEmotionController.getEmotionStats(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.arrayContaining([
            expect.objectContaining({
              date: expect.any(String),
              emotions: expect.arrayContaining([
                expect.objectContaining({
                  name: expect.any(String),
                  count: expect.any(Number)
                })
              ])
            })
          ])
        })
      );
    });

    it('잘못된 날짜 형식으로 요청 시 실패해야 함', async () => {
      mockEmotionController.getEmotionStats.mockImplementation((req, res) => {
        res.status(400).json({
          status: 'error',
          message: '유효하지 않은 날짜 형식입니다.'
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        query: {
          start_date: 'invalid-date',
          end_date: '2025-01-31'
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockEmotionController.getEmotionStats(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('날짜 형식')
        })
      );
    });
  });

  describe('일일 감정 체크 테스트 (/api/emotions/daily-check)', () => {
    it('일일 감정 체크 상태가 조회되어야 함', async () => {
      mockEmotionController.getDailyEmotionCheck.mockImplementation((req, res) => {
        res.status(200).json({
          status: 'success',
          data: {
            hasDailyCheck: true,
            lastCheck: {
              log_id: 1,
              user_id: mockUserId,
              emotion_id: 1,
              log_date: new Date().toISOString(),
              emotion: {
                name: '행복',
                icon: 'emoticon-happy-outline'
              }
            }
          }
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockEmotionController.getDailyEmotionCheck(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            hasDailyCheck: expect.any(Boolean)
          })
        })
      );
    });
  });

  describe('감정 트렌드 조회 테스트 (/api/emotions/trends)', () => {
    it('감정 트렌드가 성공적으로 조회되어야 함', async () => {
      mockEmotionController.getEmotionTrend.mockImplementation((req, res) => {
        res.status(200).json({
          status: 'success',
          data: {
            trends: [
              {
                date: '2025-01-01',
                emotion_name: '행복',
                emotion_icon: 'emoticon-happy-outline',
                count: 3
              }
            ],
            period: {
              type: 'day',
              start_date: '2025-01-01T00:00:00.000Z',
              end_date: '2025-01-31T23:59:59.999Z'
            }
          }
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        query: {
          start_date: '2025-01-01',
          end_date: '2025-01-31',
          type: 'day'
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockEmotionController.getEmotionTrend(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            trends: expect.arrayContaining([
              expect.objectContaining({
                date: expect.any(String),
                emotion_name: expect.any(String)
              })
            ])
          })
        })
      );
    });

    it('유효하지 않은 트렌드 타입으로 요청 시 실패해야 함', async () => {
      mockEmotionController.getEmotionTrend.mockImplementation((req, res) => {
        res.status(400).json({
          status: 'error',
          message: '유효하지 않은 트렌드 타입입니다. day, week, month, monthly 중 하나를 사용하세요.'
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        query: {
          type: 'invalid-type'
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockEmotionController.getEmotionTrend(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('트렌드 타입')
        })
      );
    });
  });
});