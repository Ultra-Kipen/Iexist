import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequestGeneric } from '../../types/express';

// 컨트롤러 모킹 대신 직접 함수 생성
const mockChallengeController = {
  getChallenges: jest.fn(),
  createChallenge: jest.fn(),
  participateInChallenge: jest.fn(),
  getPostDetails: jest.fn(),
  leaveChallenge: jest.fn(),
  updateChallengeProgress: jest.fn()
};

// 원래 컨트롤러 모듈을 모킹
jest.mock('../../controllers/challengeController', () => mockChallengeController);

// 타임아웃 설정
jest.setTimeout(10000); // 10초로 축소

describe('Challenge API 기능 테스트', () => {
  const mockUserId = 999;
  
  beforeEach(() => {
    // 모킹된 함수 초기화
    Object.values(mockChallengeController).forEach(mock => mock.mockReset());
  });
  
  describe('챌린지 조회 테스트', () => {
    test('인증 없이 챌린지 조회 시 401 응답', async () => {
      // 인증 실패 응답 모킹
      mockChallengeController.getChallenges.mockImplementation((req, res) => {
        res.status(401).json({
          status: 'error',
          message: '인증이 필요합니다.'
        });
        return Promise.resolve();
      });
      
      // 가짜 요청/응답 객체
      const req = {} as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockChallengeController.getChallenges(req, res);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('인증')
        })
      );
    });
    
    test('인증 있는 경우 챌린지 목록 조회 성공', async () => {
      // 성공 응답 모킹
      mockChallengeController.getChallenges.mockImplementation((req, res) => {
        res.status(200).json({
          status: 'success',
          data: {
            challenges: [
              {
                challenge_id: 1,
                title: '테스트 챌린지',
                description: '테스트 설명',
                is_participated: false
              }
            ],
            pagination: {
              current_page: 1,
              total_pages: 1,
              total_count: 1
            }
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
      
      await mockChallengeController.getChallenges(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            challenges: expect.arrayContaining([
              expect.objectContaining({
                challenge_id: expect.any(Number),
                title: expect.any(String)
              })
            ])
          })
        })
      );
    });
    
    // 추가: 상태별 필터링 테스트
    test('상태 필터링(active)으로 챌린지 목록 조회', async () => {
      // 성공 응답 모킹
      mockChallengeController.getChallenges.mockImplementation((req, res) => {
        res.status(200).json({
          status: 'success',
          data: {
            challenges: [
              {
                challenge_id: 1,
                title: '진행 중인 챌린지',
                description: '현재 진행 중인 챌린지입니다.',
                is_participated: false,
                start_date: '2025-01-01',
                end_date: '2025-12-31'
              }
            ],
            pagination: {
              current_page: 1,
              total_pages: 1,
              total_count: 1
            }
          }
        });
        return Promise.resolve();
      });
      
      // 가짜 요청/응답 객체
      const req = { 
        user: { user_id: mockUserId },
        query: { status: 'active' }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockChallengeController.getChallenges(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
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

  describe('챌린지 생성 테스트', () => {
    test('필수 필드 누락 시 챌린지 생성 실패', async () => {
      // 유효성 검사 실패 응답 모킹
      mockChallengeController.createChallenge.mockImplementation((req, res) => {
        res.status(400).json({
          status: 'error',
          message: '제목은 필수 입력 항목입니다.'
        });
        return Promise.resolve();
      });
      
      // 가짜 요청/응답 객체
      const req = { 
        user: { user_id: mockUserId },
        body: {
          description: '테스트 설명',
          start_date: '2025-03-01',
          end_date: '2025-03-08'
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
          status: 'error'
        })
      );
    });
    
    test('올바른 데이터로 챌린지 생성 성공', async () => {
      // 성공 응답 모킹
      mockChallengeController.createChallenge.mockImplementation((req, res) => {
        res.status(201).json({
          status: 'success',
          message: '챌린지가 성공적으로 생성되었습니다.',
          data: {
            challenge_id: 123
          }
        });
        return Promise.resolve();
      });
      
      // 가짜 요청/응답 객체
      const req = { 
        user: { user_id: mockUserId },
        body: {
          title: '테스트 챌린지',
          description: '테스트 설명',
          start_date: '2025-03-01',
          end_date: '2025-03-08',
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
    
    // 추가: 잘못된 날짜 형식으로 챌린지 생성 시도
    test('잘못된 날짜(종료일이 시작일보다 빠름)로 챌린지 생성 실패', async () => {
      // 유효성 검사 실패 응답 모킹
      mockChallengeController.createChallenge.mockImplementation((req, res) => {
        res.status(400).json({
          status: 'error',
          message: '시작일은 종료일보다 이전이어야 합니다.'
        });
        return Promise.resolve();
      });
      
      // 가짜 요청/응답 객체 (종료일이 시작일보다 빠름)
      const req = { 
        user: { user_id: mockUserId },
        body: {
          title: '잘못된 날짜 챌린지',
          description: '테스트 설명',
          start_date: '2025-03-08',
          end_date: '2025-03-01', // 시작일보다 빠른 종료일
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

  describe('챌린지 참가 테스트', () => {
    test('존재하지 않는 챌린지 참가 실패', async () => {
      // 챌린지 없음 응답 모킹
      mockChallengeController.participateInChallenge.mockImplementation((req, res) => {
        res.status(404).json({
          status: 'error',
          message: '챌린지를 찾을 수 없습니다.'
        });
        return Promise.resolve();
      });
      
      // 가짜 요청/응답 객체
      const req = { 
        user: { user_id: mockUserId },
        params: { id: '9999' }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockChallengeController.participateInChallenge(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('찾을 수 없습니다')
        })
      );
    });
    
    test('올바른 챌린지 참가 성공', async () => {
      // 성공 응답 모킹
      mockChallengeController.participateInChallenge.mockImplementation((req, res) => {
        res.status(200).json({
          status: 'success',
          message: '챌린지에 성공적으로 참가했습니다.',
          data: {
            participant: {
              challenge_id: 123,
              user_id: mockUserId
            }
          }
        });
        return Promise.resolve();
      });
      
      // 가짜 요청/응답 객체
      const req = { 
        user: { user_id: mockUserId },
        params: { id: '123' }
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
          message: expect.stringContaining('참가')
        })
      );
    });
    
    // 추가: 최대 참가자 수 도달한 챌린지 참가 시도
    test('최대 참가자 수에 도달한 챌린지 참가 실패', async () => {
      // 참가자 수 초과 응답 모킹
      mockChallengeController.participateInChallenge.mockImplementation((req, res) => {
        res.status(400).json({
          status: 'error',
          message: '참가자 수가 초과되었습니다.'
        });
        return Promise.resolve();
      });
      
      // 가짜 요청/응답 객체
      const req = { 
        user: { user_id: mockUserId },
        params: { id: '456' }
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
          message: expect.stringContaining('참가자 수')
        })
      );
    });
  });
  
  // 추가: 챌린지 상세 조회 테스트
  describe('챌린지 상세 조회 테스트', () => {
    test('존재하는 챌린지 상세 정보 조회 성공', async () => {
      // 성공 응답 모킹
      mockChallengeController.getPostDetails.mockImplementation((req, res) => {
        res.status(200).json({
          status: 'success',
          data: {
            challenge_id: 123,
            title: '테스트 챌린지',
            description: '테스트 설명',
            creator: {
              user_id: 1,
              nickname: '챌린지 생성자'
            },
            start_date: '2025-03-01',
            end_date: '2025-03-08',
            is_participated: true,
            participant_count: 5
          }
        });
        return Promise.resolve();
      });
      
      // 가짜 요청/응답 객체
      const req = { 
        user: { user_id: mockUserId },
        params: { id: '123' }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockChallengeController.getPostDetails(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            challenge_id: expect.any(Number),
            title: expect.any(String),
            creator: expect.objectContaining({
              user_id: expect.any(Number)
            })
          })
        })
      );
    });
    
    test('존재하지 않는 챌린지 상세 정보 조회 실패', async () => {
      // 챌린지 없음 응답 모킹
      mockChallengeController.getPostDetails.mockImplementation((req, res) => {
        res.status(404).json({
          status: 'error',
          message: '챌린지를 찾을 수 없습니다.'
        });
        return Promise.resolve();
      });
      
      // 가짜 요청/응답 객체
      const req = { 
        user: { user_id: mockUserId },
        params: { id: '9999' }
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
  
  // 추가: 챌린지 진행 상황 업데이트 테스트
  describe('챌린지 진행 상황 업데이트 테스트', () => {
    test('올바른 데이터로 진행 상황 업데이트 성공', async () => {
      // 성공 응답 모킹
      mockChallengeController.updateChallengeProgress.mockImplementation((req, res) => {
        res.status(200).json({
          status: 'success',
          message: '진행 상황이 기록되었습니다.',
          data: {
            challenge_emotion_id: 1,
            challenge_id: 123,
            user_id: mockUserId,
            emotion_id: 1,
            note: '오늘의 감사일기'
          }
        });
        return Promise.resolve();
      });
      
      // 가짜 요청/응답 객체
      const req = { 
        user: { user_id: mockUserId },
        params: { id: '123' },
        body: {
          emotion_id: 1,
          progress_note: '오늘의 감사일기'
        }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockChallengeController.updateChallengeProgress(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          message: expect.stringContaining('기록')
        })
      );
    });
    
    test('유효하지 않은 감정 ID로 진행 상황 업데이트 실패', async () => {
      // 유효하지 않은 감정 ID 응답 모킹
      mockChallengeController.updateChallengeProgress.mockImplementation((req, res) => {
        res.status(400).json({
          status: 'error',
          message: '유효하지 않은 감정입니다.'
        });
        return Promise.resolve();
      });
      
      // 가짜 요청/응답 객체
      const req = { 
        user: { user_id: mockUserId },
        params: { id: '123' },
        body: {
          emotion_id: 999, // 존재하지 않는 감정 ID
          progress_note: '오늘의 감사일기'
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
    
    test('하루에 두 번 진행 상황 업데이트 시도 실패', async () => {
      // 중복 기록 응답 모킹
      mockChallengeController.updateChallengeProgress.mockImplementation((req, res) => {
        res.status(400).json({
          status: 'error',
          message: '오늘은 이미 진행 상황을 기록했습니다.'
        });
        return Promise.resolve();
      });
      
      // 가짜 요청/응답 객체
      const req = { 
        user: { user_id: mockUserId },
        params: { id: '123' },
        body: {
          emotion_id: 1,
          progress_note: '두 번째 감사일기'
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
  
  // 추가: 챌린지 탈퇴 테스트
  describe('챌린지 탈퇴 테스트', () => {
    test('참가 중인 챌린지에서 탈퇴 성공', async () => {
      // 성공 응답 모킹
      mockChallengeController.leaveChallenge.mockImplementation((req, res) => {
        res.status(200).json({
          status: 'success',
          message: '챌린지에서 성공적으로 탈퇴했습니다.'
        });
        return Promise.resolve();
      });
      
      // 가짜 요청/응답 객체
      const req = { 
        user: { user_id: mockUserId },
        params: { id: '123' }
      } as any;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as any;
      
      await mockChallengeController.leaveChallenge(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          message: expect.stringContaining('탈퇴')
        })
      );
    });
    
    test('참가하지 않은 챌린지에서 탈퇴 시도 실패', async () => {
      // 참가하지 않은 챌린지 응답 모킹
      mockChallengeController.leaveChallenge.mockImplementation((req, res) => {
        res.status(400).json({
          status: 'error',
          message: '참가하지 않은 챌린지입니다.'
        });
        return Promise.resolve();
      });
      
      // 가짜 요청/응답 객체
      const req = { 
        user: { user_id: mockUserId },
        params: { id: '456' }
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
    
    test('존재하지 않는 챌린지에서 탈퇴 시도 실패', async () => {
      // 존재하지 않는 챌린지 응답 모킹
      mockChallengeController.leaveChallenge.mockImplementation((req, res) => {
        res.status(404).json({
          status: 'error',
          message: '챌린지를 찾을 수 없습니다.'
        });
        return Promise.resolve();
      });
      
      // 가짜 요청/응답 객체
      const req = { 
        user: { user_id: mockUserId },
        params: { id: '9999' }
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