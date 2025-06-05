// __tests__/unit/services/api/challengeService.test.ts

import challengeService, { 
    ChallengeCreateData, 
    ChallengeProgressData 
  } from '../../../../src/services/api/challengeService';
  import apiClient from '../../../../src/services/api/client';
  
  // apiClient를 모킹
  jest.mock('../../../../src/services/api/client');
  const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;
  
  describe('challengeService', () => {
    beforeEach(() => {
      // 모든 모크 초기화
      jest.clearAllMocks();
    });
  
    describe('createChallenge', () => {
      it('챌린지 생성에 성공해야 함', async () => {
        const mockChallengeData: ChallengeCreateData = {
          title: '긍정 챌린지',
          description: '매일 긍정적인 마인드셋 갖기',
          start_date: '2024-05-01',
          end_date: '2024-05-31',
          is_public: true
        };
  
        const mockResponse = { 
          data: { 
            id: 1, 
            ...mockChallengeData 
          } 
        };
  
        mockedApiClient.post.mockResolvedValue(mockResponse);
  
        const result = await challengeService.createChallenge(mockChallengeData);
        
        expect(mockedApiClient.post).toHaveBeenCalledWith('/challenges', mockChallengeData);
        expect(result).toEqual(mockResponse);
      });
    });
  
    describe('getChallenges', () => {
      it('챌린지 목록 조회에 성공해야 함', async () => {
        const mockParams = { 
          page: 1, 
          limit: 10, 
          status: 'active' as 'active' 
        };
  
        const mockResponse = { 
          data: [{ id: 1, title: '첫 번째 챌린지' }] 
        };
  
        mockedApiClient.get.mockResolvedValue(mockResponse);
  
        const result = await challengeService.getChallenges(mockParams);
        
        expect(mockedApiClient.get).toHaveBeenCalledWith('/challenges', { params: mockParams });
        expect(result).toEqual(mockResponse);
      });
    });
  
    describe('getChallengeDetails', () => {
      it('특정 챌린지 상세 정보 조회에 성공해야 함', async () => {
        const challengeId = 1;
        const mockResponse = { 
          data: { 
            id: challengeId, 
            title: '상세 챌린지' 
          } 
        };
  
        mockedApiClient.get.mockResolvedValue(mockResponse);
  
        const result = await challengeService.getChallengeDetails(challengeId);
        
        expect(mockedApiClient.get).toHaveBeenCalledWith(`/challenges/${challengeId}`);
        expect(result).toEqual(mockResponse);
      });
    });
  
    describe('updateChallengeProgress', () => {
      it('챌린지 진행 상황 업데이트에 성공해야 함', async () => {
        const challengeId = 1;
        const progressData: ChallengeProgressData = {
          emotion_id: 1,
          progress_note: '오늘도 긍정적인 하루'
        };
  
        const mockResponse = { 
          data: { 
            message: '진행 상황 업데이트 성공' 
          } 
        };
  
        mockedApiClient.post.mockResolvedValue(mockResponse);
  
        const result = await challengeService.updateChallengeProgress(challengeId, progressData);
        
        expect(mockedApiClient.post).toHaveBeenCalledWith(
          `/challenges/${challengeId}/progress`, 
          progressData
        );
        expect(result).toEqual(mockResponse);
      });
    });
  
    describe('참여 및 탈퇴', () => {
      it('챌린지 참여에 성공해야 함', async () => {
        const challengeId = 1;
        const mockResponse = { 
          data: { 
            message: '챌린지 참여 성공' 
          } 
        };
  
        mockedApiClient.post.mockResolvedValue(mockResponse);
  
        const result = await challengeService.participateInChallenge(challengeId);
        
        expect(mockedApiClient.post).toHaveBeenCalledWith(`/challenges/${challengeId}/participate`);
        expect(result).toEqual(mockResponse);
      });
  
      it('챌린지 탈퇴에 성공해야 함', async () => {
        const challengeId = 1;
        const mockResponse = { 
          data: { 
            message: '챌린지 탈퇴 성공' 
          } 
        };
  
        mockedApiClient.delete.mockResolvedValue(mockResponse);
  
        const result = await challengeService.leaveChallenge(challengeId);
        
        expect(mockedApiClient.delete).toHaveBeenCalledWith(`/challenges/${challengeId}/participate`);
        expect(result).toEqual(mockResponse);
      });
    });
  });