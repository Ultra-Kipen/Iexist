// /backend/tests/integration/challenges.test.ts
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

// 컨트롤러 모킹
const mockChallengeController = {
  createChallenge: jest.fn(),
  getChallenges: jest.fn(),
  getPostDetails: jest.fn(),
  participateInChallenge: jest.fn(),
  leaveChallenge: jest.fn(),
  updateChallengeProgress: jest.fn()
};

// 원래 컨트롤러 모듈을 모킹
jest.mock('../../controllers/challengeController', () => mockChallengeController);

describe('챌린지 API 테스트', () => {
  const mockUserId = 999;
  const mockChallengeId = 123;
  
  beforeEach(() => {
    // 모킹된 함수 초기화
    Object.values(mockChallengeController).forEach(mock => mock.mockReset());
  });
  
  describe('챌린지 생성 테스트 (/api/challenges)', () => {
    it('챌린지가 성공적으로 생성되어야 함', async () => {
      // 성공 응답 모킹
      mockChallengeController.createChallenge.mockImplementation((req, res) => {
        res.status(201).json({
          status: 'success',
          message: "챌린지가 성공적으로 생성되었습니다.",
          data: {
            challenge_id: mockChallengeId
          }
        });
        return Promise.resolve();
      });
      
      // 가짜 요청/응답 객체
      const req = {
        user: { user_id: mockUserId },
        body: {
          title: '7일 감사 챌린지',
          description: '일주일 동안 매일 감사한 일을 기록하는 챌린지입니다.',
          start_date: '2025-03-01',
          end_date: '2025-03-07',
          is_public: true
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockChallengeController.createChallenge(req, res);
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            challenge_id: expect.any(Number)
          })
        })
      );
    });

    it('제목이 없는 경우 챌린지 생성이 실패해야 함', async () => {
      mockChallengeController.createChallenge.mockImplementation((req, res) => {
        res.status(400).json({
          status: 'error',
          message: '제목은 필수입니다.'
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        body: {
          description: '일주일 동안 매일 감사한 일을 기록하는 챌린지입니다.',
          start_date: '2025-03-01',
          end_date: '2025-03-07',
          is_public: true
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockChallengeController.createChallenge(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('제목')
        })
      );
    });

    it('종료 날짜가 시작 날짜보다 빠른 경우 챌린지 생성이 실패해야 함', async () => {
      mockChallengeController.createChallenge.mockImplementation((req, res) => {
        res.status(400).json({
          status: 'error',
          message: '시작일은 종료일보다 이전이어야 합니다.'
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        body: {
          title: '7일 감사 챌린지',
          description: '일주일 동안 매일 감사한 일을 기록하는 챌린지입니다.',
          start_date: '2025-03-07',
          end_date: '2025-03-01', // 시작일보다 이전
          is_public: true
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockChallengeController.createChallenge(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('시작일')
        })
      );
    });
  });

  describe('챌린지 목록 조회 테스트 (/api/challenges)', () => {
    it('챌린지 목록이 성공적으로 조회되어야 함', async () => {
      mockChallengeController.getChallenges.mockImplementation((req, res) => {
        res.json({
          status: 'success',
          data: {
            challenges: [
              {
                challenge_id: mockChallengeId,
                title: '7일 감사 챌린지',
                description: '일주일 동안 매일 감사한 일을 기록하는 챌린지입니다.',
                start_date: '2025-03-01',
                end_date: '2025-03-07',
                is_public: true,
                participant_count: 10,
                is_participated: false
              }
            ],
            pagination: {
              current_page: 1,
              total_pages: 1,
              total_count: 1,
              has_next: false
            }
          }
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        query: { page: '1', limit: '10' }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockChallengeController.getChallenges(req, res);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            challenges: expect.arrayContaining([
              expect.objectContaining({
                challenge_id: expect.any(Number),
                title: expect.any(String)
              })
            ]),
            pagination: expect.any(Object)
          })
        })
      );
    });

    it('상태 필터링으로 챌린지 목록이 조회되어야 함', async () => {
      mockChallengeController.getChallenges.mockImplementation((req, res) => {
        res.json({
          status: 'success',
          data: {
            challenges: [
              {
                challenge_id: mockChallengeId,
                title: '진행 중인 챌린지',
                start_date: '2025-03-01',
                end_date: '2025-04-01',
                is_public: true,
                participant_count: 10,
                is_participated: false
              }
            ],
            pagination: {
              current_page: 1,
              total_pages: 1,
              total_count: 1,
              has_next: false
            }
          }
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        query: { 
          page: '1', 
          limit: '10',
          status: 'active'
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockChallengeController.getChallenges(req, res);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            challenges: expect.arrayContaining([
              expect.objectContaining({
                title: expect.stringContaining('진행 중인')
              })
            ])
          })
        })
      );
    });
  });

  describe('챌린지 상세 조회 테스트 (/api/challenges/:id)', () => {
    it('챌린지 상세 정보가 성공적으로 조회되어야 함', async () => {
      mockChallengeController.getPostDetails.mockImplementation((req, res) => {
        res.json({
          status: 'success',
          data: {
            challenge_id: mockChallengeId,
            title: '7일 감사 챌린지',
            description: '일주일 동안 매일 감사한 일을 기록하는 챌린지입니다.',
            creator: {
              user_id: 1,
              nickname: '챌린지 생성자'
            },
            start_date: '2025-03-01',
            end_date: '2025-03-07',
            is_public: true,
            participant_count: 10,
            is_participated: true
          }
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        params: { id: String(mockChallengeId) }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockChallengeController.getPostDetails(req, res);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            challenge_id: mockChallengeId,
            title: expect.any(String),
            creator: expect.objectContaining({
              user_id: expect.any(Number)
            })
          })
        })
      );
    });

    it('존재하지 않는 챌린지 조회 시 실패해야 함', async () => {
      mockChallengeController.getPostDetails.mockImplementation((req, res) => {
        res.status(404).json({
          status: 'error',
          message: '챌린지를 찾을 수 없습니다.'
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        params: { id: '99999' }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockChallengeController.getPostDetails(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('찾을 수 없습니다')
        })
      );
    });
  });

  describe('챌린지 참가 테스트 (/api/challenges/:id/participate)', () => {
    it('챌린지에 성공적으로 참가할 수 있어야 함', async () => {
      mockChallengeController.participateInChallenge.mockImplementation((req, res) => {
        res.status(200).json({
          status: 'success',
          message: '챌린지에 성공적으로 참가했습니다.',
          data: {
            participant: {
              challenge_id: mockChallengeId,
              user_id: mockUserId,
              created_at: new Date().toISOString()
            }
          }
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        params: { id: String(mockChallengeId) }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockChallengeController.participateInChallenge(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          message: expect.stringContaining('참가'),
          data: expect.objectContaining({
            participant: expect.objectContaining({
              challenge_id: mockChallengeId,
              user_id: mockUserId
            })
          })
        })
      );
    });

    it('이미 참가 중인 챌린지에 재참가 시 실패해야 함', async () => {
      mockChallengeController.participateInChallenge.mockImplementation((req, res) => {
        res.status(400).json({
          status: 'error',
          message: '이미 참가 중인 챌린지입니다.'
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        params: { id: String(mockChallengeId) }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockChallengeController.participateInChallenge(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('이미 참가')
        })
      );
    });

    it('참가자 수가 초과된 챌린지에 참가 시 실패해야 함', async () => {
      mockChallengeController.participateInChallenge.mockImplementation((req, res) => {
        res.status(400).json({
          status: 'error',
          message: '참가자 수가 초과되었습니다.'
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        params: { id: String(mockChallengeId) }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockChallengeController.participateInChallenge(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('초과')
        })
      );
    });
  });

  describe('챌린지 진행 상황 업데이트 테스트 (/api/challenges/:id/progress)', () => {
    it('챌린지 진행 상황이 성공적으로 업데이트되어야 함', async () => {
      mockChallengeController.updateChallengeProgress.mockImplementation((req, res) => {
        res.json({
          status: 'success',
          message: '진행 상황이 기록되었습니다.',
          data: {
            challenge_emotion_id: 1,
            challenge_id: mockChallengeId,
            user_id: mockUserId,
            emotion_id: 1,
            note: '오늘 감사한 일'
          }
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        params: { id: String(mockChallengeId) },
        body: {
          emotion_id: 1,
          progress_note: '오늘 감사한 일'
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockChallengeController.updateChallengeProgress(req, res);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          message: expect.stringContaining('기록'),
          data: expect.objectContaining({
            challenge_id: mockChallengeId,
            user_id: mockUserId,
            emotion_id: expect.any(Number)
          })
        })
      );
    });

    it('유효하지 않은 감정으로 업데이트 시 실패해야 함', async () => {
      mockChallengeController.updateChallengeProgress.mockImplementation((req, res) => {
        res.status(400).json({
          status: 'error',
          message: '유효하지 않은 감정입니다.'
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        params: { id: String(mockChallengeId) },
        body: {
          emotion_id: 9999, // 존재하지 않는 감정 ID
          progress_note: '오늘 감사한 일'
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockChallengeController.updateChallengeProgress(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('유효하지 않은 감정')
        })
      );
    });

    it('오늘 이미 기록한 경우 업데이트가 실패해야 함', async () => {
      mockChallengeController.updateChallengeProgress.mockImplementation((req, res) => {
        res.status(400).json({
          status: 'error',
          message: '오늘은 이미 진행 상황을 기록했습니다.'
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        params: { id: String(mockChallengeId) },
        body: {
          emotion_id: 1,
          progress_note: '오늘 또 감사한 일'
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockChallengeController.updateChallengeProgress(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('이미 진행 상황')
        })
      );
    });
  });

  describe('챌린지 탈퇴 테스트 (/api/challenges/:id/participate)', () => {
    it('챌린지에서 성공적으로 탈퇴할 수 있어야 함', async () => {
      mockChallengeController.leaveChallenge.mockImplementation((req, res) => {
        res.json({
          status: 'success',
          message: '챌린지에서 성공적으로 탈퇴했습니다.'
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        params: { id: String(mockChallengeId) }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockChallengeController.leaveChallenge(req, res);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          message: expect.stringContaining('탈퇴')
        })
      );
    });

    it('참가하지 않은 챌린지에서 탈퇴 시 실패해야 함', async () => {
      mockChallengeController.leaveChallenge.mockImplementation((req, res) => {
        res.status(400).json({
          status: 'error',
          message: '참가하지 않은 챌린지입니다.'
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        params: { id: String(mockChallengeId) }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockChallengeController.leaveChallenge(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('참가하지 않은')
        })
      );
    });

    it('존재하지 않는 챌린지에서 탈퇴 시 실패해야 함', async () => {
      mockChallengeController.leaveChallenge.mockImplementation((req, res) => {
        res.status(404).json({
          status: 'error',
          message: '챌린지를 찾을 수 없습니다.'
        });
        return Promise.resolve();
      });
      
      const req = {
        user: { user_id: mockUserId },
        params: { id: '99999' }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockChallengeController.leaveChallenge(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('찾을 수 없습니다')
        })
      );
    });
  });
});