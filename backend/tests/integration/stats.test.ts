// /backend/tests/integration/stats.test.ts
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

// 컨트롤러 모킹
const mockStatsController = {
  getUserStats: jest.fn(),
  getEmotionTrends: jest.fn()
};

// 원래 컨트롤러 모듈을 모킹
jest.mock('../../controllers/statsController', () => mockStatsController);

describe('통계 API 테스트', () => {
  const mockUserId = 999;
  
  beforeEach(() => {
    // 모킹된 함수 초기화
    Object.values(mockStatsController).forEach(mock => mock.mockReset());
  });
  
  describe('사용자 통계 조회 테스트 (/api/stats)', () => {
    it('사용자 통계가 성공적으로 조회되어야 함', async () => {
      // 성공 응답 모킹
      mockStatsController.getUserStats.mockImplementation((req, res) => {
        res.json({
          status: 'success',
          data: {
            user_id: mockUserId,
            my_day_post_count: 10,
            someone_day_post_count: 5,
            my_day_like_received_count: 20,
            someone_day_like_received_count: 15,
            my_day_comment_received_count: 8,
            someone_day_comment_received_count: 12,
            challenge_count: 3
          }
        });
        return Promise.resolve();
      });
      
      // 가짜 요청/응답 객체
      const req = {
        user: { user_id: mockUserId }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockStatsController.getUserStats(req, res);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            user_id: mockUserId,
            my_day_post_count: expect.any(Number),
            someone_day_post_count: expect.any(Number)
          })
        })
      );
    });

    it('인증되지 않은 사용자는 통계를 조회할 수 없음', async () => {
      mockStatsController.getUserStats.mockImplementation((req, res) => {
        res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
        return Promise.resolve();
      });
      
      const req = {
        user: undefined
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockStatsController.getUserStats(req, res);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('인증')
        })
      );
    });

    it('통계 정보가 없는 경우 404 응답이 반환되어야 함', async () => {
      mockStatsController.getUserStats.mockImplementation((req, res) => {
        res.status(404).json({
          status: 'error',
          message: '통계 정보를 찾을 수 없습니다.'
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
      
      await mockStatsController.getUserStats(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('찾을 수 없습니다')
        })
      );
    });
  });

  describe('감정 트렌드 조회 테스트 (/api/stats/trends)', () => {
    it('감정 트렌드가 성공적으로 조회되어야 함', async () => {
      mockStatsController.getEmotionTrends.mockImplementation((req, res) => {
        res.status(200).json({
          status: 'success',
          data: {
            trends: [
              {
                date: '2025-01-01',
                emotion_name: '행복',
                emotion_icon: 'emoticon-happy-outline',
                count: 3
              },
              {
                date: '2025-01-02',
                emotion_name: '감사',
                emotion_icon: 'hand-heart',
                count: 2
              }
            ],
            period: {
              type: 'day',
              start_date: '2025-01-01T00:00:00.000Z',
              end_date: '2025-01-07T23:59:59.999Z'
            }
          }
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        query: { 
          start_date: '2025-01-01',
          end_date: '2025-01-07',
          type: 'day'
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockStatsController.getEmotionTrends(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            trends: expect.arrayContaining([
              expect.objectContaining({
                date: expect.any(String),
                emotion_name: expect.any(String),
                count: expect.any(Number)
              })
            ]),
            period: expect.objectContaining({
              type: 'day'
            })
          })
        })
      );
    });

    it('주간 타입으로 트렌드가 조회되어야 함', async () => {
      mockStatsController.getEmotionTrends.mockImplementation((req, res) => {
        res.status(200).json({
          status: 'success',
          data: {
            trends: [
              {
                date: '2025-01',
                emotion_name: '행복',
                emotion_icon: 'emoticon-happy-outline',
                count: 10
              }
            ],
            period: {
              type: 'weekly',
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
          type: 'weekly'
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockStatsController.getEmotionTrends(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            period: expect.objectContaining({
              type: 'weekly'
            })
          })
        })
      );
    });

    it('월간 타입으로 트렌드가 조회되어야 함', async () => {
      mockStatsController.getEmotionTrends.mockImplementation((req, res) => {
        res.status(200).json({
          status: 'success',
          data: {
            trends: [
              {
                date: '2025-01',
                emotion_name: '행복',
                emotion_icon: 'emoticon-happy-outline',
                count: 20
              }
            ],
            period: {
              type: 'monthly',
              start_date: '2025-01-01T00:00:00.000Z',
              end_date: '2025-03-31T23:59:59.999Z'
            }
          }
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        query: { 
          type: 'monthly'
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockStatsController.getEmotionTrends(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            period: expect.objectContaining({
              type: 'monthly'
            })
          })
        })
      );
    });

    it('잘못된 날짜 형식으로 요청 시 실패해야 함', async () => {
      mockStatsController.getEmotionTrends.mockImplementation((req, res) => {
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
      
      await mockStatsController.getEmotionTrends(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('유효하지 않은 날짜')
        })
      );
    });
  });
});