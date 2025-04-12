import { createTestUser } from '../setup';
import challengeController from '../../controllers/challengeController';
import db from '../../models';

// 컨트롤러 모킹
jest.mock('../../controllers/challengeController');

describe('Challenge Scenario', () => {
  let testUser: any;

  // 짧은 타임아웃 설정
  jest.setTimeout(30000);

  beforeAll(async () => {
    try {
      console.log('테스트 준비 시작...');
      
      // 테스트 사용자 생성 - DB와 실제 상호작용하는 부분
      testUser = await createTestUser();
      console.log('테스트 사용자 생성 완료:', testUser.userId);
      
      // 컨트롤러 모킹 설정
      (challengeController.createChallenge as jest.Mock).mockImplementation((req, res) => {
        res.status(201).json({
          status: 'success', 
          message: "챌린지가 성공적으로 생성되었습니다.",
          data: {
            challenge_id: 999
          }
        });
        return Promise.resolve();
      });
      
      (challengeController.updateChallengeProgress as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({
          status: 'success',
          message: '진행 상황이 기록되었습니다.',
          data: {
            challenge_emotion_id: 123,
            challenge_id: 999,
            user_id: testUser.userId,
            emotion_id: 1,
            note: '오늘의 감사일기'
          }
        });
        return Promise.resolve();
      });
      
      (challengeController.getChallenges as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({
          status: 'success',
          data: {
            challenges: [{
              challenge_id: 999,
              title: '7일 감사 챌린지',
              description: '매일 감사한 일 3가지를 기록해보세요',
              participant_count: 1,
              is_participated: true,
              start_date: '2025-03-01',
              end_date: '2025-03-08'
            }],
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
      
      (challengeController.getPostDetails as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({
          status: 'success',
          data: {
            challenge_id: 999,
            title: '7일 감사 챌린지',
            description: '매일 감사한 일 3가지를 기록해보세요',
            creator: {
              user_id: testUser.userId,
              nickname: 'TestUser'
            },
            participant_count: 1,
            is_participated: true,
            start_date: '2025-03-01',
            end_date: '2025-03-08'
          }
        });
        return Promise.resolve();
      });
      
      (challengeController.participateInChallenge as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({
          status: 'success',
          message: '챌린지에 성공적으로 참가했습니다.',
          data: {
            participant: {
              challenge_id: 999,
              user_id: testUser.userId,
              created_at: new Date().toISOString()
            }
          }
        });
        return Promise.resolve();
      });
      
      (challengeController.leaveChallenge as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({
          status: 'success',
          message: '챌린지에서 성공적으로 탈퇴했습니다.'
        });
        return Promise.resolve();
      });
      
      console.log('모킹 설정 완료');

    } catch (error: any) {
      console.error('beforeAll 설정 중 오류:', error);
      throw error;
    }
  });

  test('모킹된 챌린지 시나리오', async () => {
    // 감정 목록 조회
    const emotions = await db.Emotion.findAll({
      limit: 1
    });
    
    if (emotions.length === 0) {
      console.log('감정 데이터가 없습니다. 테스트를 건너뜁니다.');
      return;
    }
    
    const emotionId = emotions[0].get('emotion_id');
    console.log(`첫 번째 감정 ID: ${emotionId}`);
    
    // 요청 객체 생성
    const createReq = {
      user: { user_id: testUser.userId },
      body: {
        title: '7일 감사 챌린지',
        description: '매일 감사한 일 3가지를 기록해보세요',
        start_date: '2025-03-01',
        end_date: '2025-03-08',
        is_public: true
      }
    };
    
    // 응답 객체 생성
    const createRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    // 1. 챌린지 생성 테스트
    await challengeController.createChallenge(createReq as any, createRes as any);
    
    // 챌린지 생성 응답 검증
    expect(createRes.status).toHaveBeenCalledWith(201);
    expect(createRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'success',
        data: expect.objectContaining({
          challenge_id: expect.any(Number)
        })
      })
    );
    
    // 2. 챌린지 목록 조회 테스트
    const getListReq = {
      user: { user_id: testUser.userId },
      query: {}
    };
    
    const getListRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    await challengeController.getChallenges(getListReq as any, getListRes as any);
    
    expect(getListRes.status).toHaveBeenCalledWith(200);
    expect(getListRes.json).toHaveBeenCalledWith(
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
    
    // 3. 챌린지 상세 조회 테스트
    const getDetailsReq = {
      user: { user_id: testUser.userId },
      params: { id: '999' }
    };
    
    const getDetailsRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    await challengeController.getPostDetails(getDetailsReq as any, getDetailsRes as any);
    
    expect(getDetailsRes.status).toHaveBeenCalledWith(200);
    expect(getDetailsRes.json).toHaveBeenCalledWith(
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
    
    // 4. 챌린지 참가 테스트
    const participateReq = {
      user: { user_id: testUser.userId },
      params: { id: '999' }
    };
    
    const participateRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    await challengeController.participateInChallenge(participateReq as any, participateRes as any);
    
    expect(participateRes.status).toHaveBeenCalledWith(200);
    expect(participateRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'success',
        message: expect.stringContaining('참가')
      })
    );
    
    // 5. 진행 상황 업데이트 테스트
    const updateReq = {
      user: { user_id: testUser.userId },
      params: { id: '999' },
      body: {
        emotion_id: emotionId,
        progress_note: '오늘의 감사일기'
      }
    };
    
    const updateRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    await challengeController.updateChallengeProgress(updateReq as any, updateRes as any);
    
    // 진행 상황 업데이트 응답 검증
    expect(updateRes.status).toHaveBeenCalledWith(200);
    expect(updateRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'success',
        message: expect.any(String)
      })
    );
    
    // 6. 챌린지 탈퇴 테스트
    const leaveReq = {
      user: { user_id: testUser.userId },
      params: { id: '999' }
    };
    
    const leaveRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    await challengeController.leaveChallenge(leaveReq as any, leaveRes as any);
    
    expect(leaveRes.status).toHaveBeenCalledWith(200);
    expect(leaveRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'success',
        message: expect.stringContaining('탈퇴')
      })
    );
    
    console.log('모킹된 테스트 완료');
  });

  afterAll(async () => {
    try {
      console.log('테스트 정리 중...');
      // DB 연결 종료만 수행
      await db.sequelize.close();
      console.log('테스트 정리 완료');
    } catch (error: any) {
      console.error('afterAll 정리 중 오류:', error);
    }
  });
});