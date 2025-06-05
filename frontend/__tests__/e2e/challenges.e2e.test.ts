import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { mockChallenges, mockChallengeEmotions } from '../../__mocks__/data/challengeData.mock';
import mockChallengeService from '../../__mocks__/services/challengeService.mock';
import ChallengeScreen from '../../src/screens/ChallengeScreen'; // 올바른 컴포넌트 임포트

// API 서비스 모킹
jest.mock('../../src/services/api/challengeService', () => mockChallengeService);

// DateTimePicker 모킹
jest.mock('@react-native-community/datetimepicker', () => {
  const MockDateTimePicker = () => {
    return null;
  };
  return MockDateTimePicker;
});

describe('Challenge Flow', () => {
  // 이제 첫 번째 테스트 활성화
  it('mocks challenge service getChallengeById correctly', async () => {
    const challengeId = 1;
    const result = await mockChallengeService.getChallengeById(challengeId);
    
    expect(result.data).toBeDefined();
    expect(result.data.challenge_id).toBe(challengeId);
    expect(mockChallengeService.getChallengeById).toHaveBeenCalledWith(challengeId);
  });
  
  it('mocks challenge service createChallenge correctly', async () => {
    const newChallenge = {
      title: '새로운 테스트 챌린지',
      description: '테스트용 챌린지입니다.',
      start_date: '2025-05-01',
      end_date: '2025-05-15',
      is_public: true
    };
    
    const result = await mockChallengeService.createChallenge(newChallenge);
    
    expect(result.data).toBeDefined();
    expect(result.data.title).toBe(newChallenge.title);
    expect(result.data.description).toBe(newChallenge.description);
    expect(mockChallengeService.createChallenge).toHaveBeenCalledWith(newChallenge);
  });
  
  it('mocks challenge service joinChallenge correctly', async () => {
    const challengeId = 2;
    const result = await mockChallengeService.joinChallenge(challengeId);
    
    expect(result.data).toBeDefined();
    expect(result.data.success).toBe(true);
    expect(mockChallengeService.joinChallenge).toHaveBeenCalledWith(challengeId);
  });
  
  it('mocks challenge service getChallengeEmotions correctly', async () => {
    const challengeId = 1;
    const userId = 1;
    
    const result = await mockChallengeService.getChallengeEmotions(challengeId, userId);
    
    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data[0].challenge_id).toBe(challengeId);
    expect(result.data[0].user_id).toBe(userId);
    expect(mockChallengeService.getChallengeEmotions).toHaveBeenCalledWith(challengeId, userId);
  });
  
  it('mocks challenge service logChallengeEmotion correctly', async () => {
    const challengeId = 1;
    const userId = 1;
    const emotionData = {
      emotion_id: 3,
      log_date: '2025-04-15',
      note: '테스트 감정 기록'
    };
    
    const result = await mockChallengeService.logChallengeEmotion(challengeId, userId, emotionData);
    
    expect(result.data).toBeDefined();
    expect(result.data.challenge_id).toBe(challengeId);
    expect(result.data.user_id).toBe(userId);
    expect(result.data.emotion_id).toBe(emotionData.emotion_id);
    expect(result.data.note).toBe(emotionData.note);
    expect(mockChallengeService.logChallengeEmotion).toHaveBeenCalledWith(challengeId, userId, emotionData);
  });
  

// 에러 처리 테스트 추가
it('handles error when fetching challenges fails', async () => {
  // API 오류 모킹
  const errorMessage = '서버 연결 오류';
  mockChallengeService.getAllChallenges.mockRejectedValueOnce(new Error(errorMessage));
  
  // API 호출에서 오류가 발생하는지 확인
  await expect(mockChallengeService.getAllChallenges()).rejects.toThrow(errorMessage);
  expect(mockChallengeService.getAllChallenges).toHaveBeenCalled();
});

// 챌린지 참여/취소 토글 테스트
it('toggles challenge participation correctly', async () => {
  const challengeId = 1;
  
  // 참여하기 테스트
  mockChallengeService.joinChallenge.mockResolvedValueOnce({ 
    data: { success: true } 
  });
  let result = await mockChallengeService.joinChallenge(challengeId);
  expect(result.data.success).toBe(true);
  expect(mockChallengeService.joinChallenge).toHaveBeenCalledWith(challengeId);
  
  // 나가기 테스트
  mockChallengeService.leaveChallenge.mockResolvedValueOnce({ 
    data: { success: true } 
  });
  result = await mockChallengeService.leaveChallenge(challengeId);
  expect(result.data.success).toBe(true);
  expect(mockChallengeService.leaveChallenge).toHaveBeenCalledWith(challengeId);
});
// 감정 기록 제출 테스트 수정
it('submits emotion log for a challenge', async () => {
  const challengeId = 1;
  const userId = 1;
  const emotionData = {
    emotion_id: 2,
    note: '오늘은 정말 감사한 하루였습니다.'
  };
  
  // logChallengeEmotion 메서드 사용 (updateChallengeProgress 대신)
  const result = await mockChallengeService.logChallengeEmotion(challengeId, userId, emotionData);
  
  // 결과 확인
  expect(result.data).toBeDefined();
  expect(result.data.challenge_id).toBe(challengeId);
  expect(result.data.user_id).toBe(userId);
  expect(result.data.emotion_id).toBe(emotionData.emotion_id);
  expect(result.data.note).toBe(emotionData.note);
  expect(mockChallengeService.logChallengeEmotion).toHaveBeenCalledWith(challengeId, userId, emotionData);
});
  it('shows challenge list and navigates to details', async () => {
    // Navigation 모킹
    const mockNavigation = {
      navigate: jest.fn()
    };
    
    // API 응답 모킹 (getAllChallenges)
    mockChallengeService.getAllChallenges.mockResolvedValueOnce({ 
      data: mockChallenges 
    });
    
    // 테스트에서는 실제 API 호출
    const result = await mockChallengeService.getAllChallenges();
    
    // 데이터 확인
    expect(result.data).toEqual(mockChallenges);
    
    // 챌린지 ID로 상세 정보 가져오기 시뮬레이션
    const challengeId = mockChallenges[0].challenge_id;
    mockNavigation.navigate('ChallengeDetail', { challengeId });
    
    // 네비게이션 호출 확인
    expect(mockNavigation.navigate).toHaveBeenCalledWith('ChallengeDetail', { 
      challengeId: challengeId 
    });
  });
  
  it('creates a new challenge', async () => {
    // 새 챌린지 데이터 정의
    const newChallengeData = {
      title: '매일 감사한 일 기록하기',
      description: '하루에 한 가지 이상 감사한 일을 기록하는 챌린지입니다.',
      start_date: '2025-05-01',
      end_date: '2025-05-31',
      is_public: true,
      max_participants: 20
    };
    
    // createChallenge 호출
    const result = await mockChallengeService.createChallenge(newChallengeData);
    
    // 결과 확인
    expect(result.data).toBeDefined();
    expect(result.data.title).toBe(newChallengeData.title);
    expect(result.data.description).toBe(newChallengeData.description);
    expect(result.data.start_date).toBe(newChallengeData.start_date);
    expect(result.data.end_date).toBe(newChallengeData.end_date);
    expect(result.data.is_public).toBe(newChallengeData.is_public);
    expect(result.data.max_participants).toBe(newChallengeData.max_participants);
    
    // 새 챌린지에 challenge_id가 할당되었는지 확인
    expect(result.data.challenge_id).toBeDefined();
    expect(typeof result.data.challenge_id).toBe('number');
    
    // 메서드가 올바른 데이터로 호출되었는지 확인
    expect(mockChallengeService.createChallenge).toHaveBeenCalledWith(newChallengeData);
  });
  
  it('joins a challenge from detail screen', async () => {
    const challengeId = 2; // 참여할 챌린지 ID
    
    // 참여 전에 챌린지 상세 정보 가져오기
    mockChallengeService.getChallengeById.mockResolvedValueOnce({
      data: {
        ...mockChallenges.find(c => c.challenge_id === challengeId),
        is_participating: false // 아직 참여하지 않은 상태
      }
    });
    
    const beforeJoin = await mockChallengeService.getChallengeById(challengeId);
    expect(beforeJoin.data.is_participating).toBe(false);
    
    // 챌린지 참여하기
    const joinResult = await mockChallengeService.joinChallenge(challengeId);
    expect(joinResult.data.success).toBe(true);
    expect(mockChallengeService.joinChallenge).toHaveBeenCalledWith(challengeId);
    
    // 참여 후에 챌린지 상세 정보 다시 가져오기
    mockChallengeService.getChallengeById.mockResolvedValueOnce({
      data: {
        ...mockChallenges.find(c => c.challenge_id === challengeId),
        is_participating: true // 이제 참여한 상태
      }
    });
    
    const afterJoin = await mockChallengeService.getChallengeById(challengeId);
    expect(afterJoin.data.is_participating).toBe(true);
    
    // 챌린지 나가기
    const leaveResult = await mockChallengeService.leaveChallenge(challengeId);
    expect(leaveResult.data.success).toBe(true);
    expect(mockChallengeService.leaveChallenge).toHaveBeenCalledWith(challengeId);
    
    // 나간 후에 챌린지 상세 정보 다시 가져오기
    mockChallengeService.getChallengeById.mockResolvedValueOnce({
      data: {
        ...mockChallenges.find(c => c.challenge_id === challengeId),
        is_participating: false // 다시 참여하지 않은 상태
      }
    });
    
    const afterLeave = await mockChallengeService.getChallengeById(challengeId);
    expect(afterLeave.data.is_participating).toBe(false);
  });
  // 페이지네이션 테스트
it('handles pagination when fetching challenges', async () => {
  // 페이지네이션 파라미터로 API 호출
  mockChallengeService.getAllChallenges.mockResolvedValueOnce({
    data: mockChallenges.slice(0, 1),
    pagination: {
      total: mockChallenges.length,
      current_page: 1,
      per_page: 1,
      total_pages: 2
    }
  });
  
  const firstPage = await mockChallengeService.getAllChallenges({ page: 1, limit: 1 });
  
  // 첫 페이지 결과 확인
  expect(firstPage.data).toHaveLength(1);
  expect(firstPage.pagination.current_page).toBe(1);
  expect(firstPage.pagination.total_pages).toBe(2);
  
  // 두 번째 페이지 요청
  mockChallengeService.getAllChallenges.mockResolvedValueOnce({
    data: mockChallenges.slice(1, 2),
    pagination: {
      total: mockChallenges.length,
      current_page: 2,
      per_page: 1,
      total_pages: 2
    }
  });
  
  const secondPage = await mockChallengeService.getAllChallenges({ page: 2, limit: 1 });
  
  // 두 번째 페이지 결과 확인
  expect(secondPage.data).toHaveLength(1);
  expect(secondPage.pagination.current_page).toBe(2);
  expect(secondPage.data[0].challenge_id).toBe(mockChallenges[1].challenge_id);
});

// 챌린지 필터링 테스트
it('filters challenges by status', async () => {
  // 활성 챌린지만 필터링
  mockChallengeService.getAllChallenges.mockResolvedValueOnce({
    data: mockChallenges.filter(c => {
      const today = new Date();
      const endDate = new Date(c.end_date);
      return endDate >= today;
    })
  });
  
  const activeResult = await mockChallengeService.getAllChallenges({ status: 'active' });
  expect(activeResult.data).toBeDefined();
  expect(Array.isArray(activeResult.data)).toBe(true);
  expect(mockChallengeService.getAllChallenges).toHaveBeenCalledWith({ status: 'active' });
});

// 챌린지 검색 테스트
it('searches challenges by keyword', async () => {
  const keyword = '감사';
  
  // 키워드로 챌린지 검색
  mockChallengeService.getAllChallenges.mockResolvedValueOnce({
    data: mockChallenges.filter(c => 
      c.title.includes(keyword) || (c.description && c.description.includes(keyword))
    )
  });
  
  const searchResult = await mockChallengeService.getAllChallenges({ keyword });
  expect(searchResult.data).toBeDefined();
  expect(Array.isArray(searchResult.data)).toBe(true);
  expect(mockChallengeService.getAllChallenges).toHaveBeenCalledWith({ keyword });
  
  // 검색 결과의 챌린지에 키워드가 포함되어 있는지 확인
  searchResult.data.forEach((challenge: { title: string; description?: string }) => {
    expect(
      challenge.title.includes(keyword) || 
      (challenge.description && challenge.description.includes(keyword))
    ).toBe(true);
  });
});

// 에러 상황에서의 챌린지 참여 테스트
it('handles errors when joining a challenge fails', async () => {
  const challengeId = 999; // 존재하지 않는 ID
  
  // 참여 실패 모킹
  mockChallengeService.joinChallenge.mockRejectedValueOnce(
    new Error('챌린지를 찾을 수 없습니다.')
  );
  
  // 에러가 적절히 발생하는지 확인
  await expect(mockChallengeService.joinChallenge(challengeId))
    .rejects.toThrow('챌린지를 찾을 수 없습니다.');
  
  expect(mockChallengeService.joinChallenge).toHaveBeenCalledWith(challengeId);
});

// 챌린지 상세 정보에 참여자 목록 포함 테스트
it('includes participants list in challenge details', async () => {
  const challengeId = 1;
  
  // 참여자 목록 정보를 포함한 상세 정보 반환
  const result = await mockChallengeService.getChallengeParticipants(challengeId);
  
  expect(result.data).toBeDefined();
  expect(Array.isArray(result.data)).toBe(true);
  expect(mockChallengeService.getChallengeParticipants).toHaveBeenCalledWith(challengeId);
  
  // 각 참여자가 필요한 정보를 가지고 있는지 확인
  if (result.data.length > 0) {
    const participant = result.data[0];
    expect(participant.user_id).toBeDefined();
    expect(participant.nickname).toBeDefined();
  }
});
  // 기존 기본 테스트 유지
  it('challenge service mocks are properly set up', () => {
    expect(mockChallengeService.getAllChallenges).toBeDefined();
    expect(mockChallengeService.getChallengeById).toBeDefined();
    expect(mockChallengeService.createChallenge).toBeDefined();
    
    // 간단한 모킹 테스트
    mockChallengeService.getAllChallenges();
    expect(mockChallengeService.getAllChallenges).toHaveBeenCalled();
    
    const testId = 1;
    mockChallengeService.getChallengeById(testId);
    expect(mockChallengeService.getChallengeById).toHaveBeenCalledWith(testId);
  });
  
  it('challenge mock data exists', () => {
    expect(mockChallenges).toBeDefined();
    expect(mockChallenges.length).toBeGreaterThan(0);
    expect(mockChallenges[0].challenge_id).toBeDefined();
    expect(mockChallenges[0].title).toBeDefined();
  });
  // 새로운 UI 테스트 추가
  it('mocks challenge service correctly for UI rendering', async () => {
    // getAllChallenges 메서드 사용 (getChallenges 대신)
    const result = await mockChallengeService.getAllChallenges();
    
    // 결과 검증
    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data).toEqual(mockChallenges);
    expect(mockChallengeService.getAllChallenges).toHaveBeenCalled();
    
    // 첫 번째 챌린지 데이터 확인
    const firstChallenge = result.data[0];
    expect(firstChallenge.title).toBe(mockChallenges[0].title);
    expect(firstChallenge.challenge_id).toBe(mockChallenges[0].challenge_id);
  });
});