// __tests__/e2e/challenges.e2e.test.ts
import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import ChallengeScreen from '../../src/screens/ChallengeScreen';
import CreateChallengeScreen from '../../src/screens/CreateChallengeScreen';
import ChallengeDetailScreen from '../../src/screens/ChallengeDetailScreen';
import { mockChallenges } from '../mocks/data/challengeData.mock';
import mockChallengeService from '../mocks/services/challengeService.mock';

// API 서비스 모킹
jest.mock('../../src/services/api/challengeService', () => mockChallengeService);

describe('Challenge Flow', () => {
  it('shows challenge list and navigates to details', async () => {
    const mockNavigation = {
      navigate: jest.fn()
    };
    
    const { getByText, getAllByTestId } = render(
      <ChallengeScreen navigation={mockNavigation} />
    );
    
    // 챌린지 목록 로드 대기
    await waitFor(() => {
      expect(getAllByTestId('challenge-item').length).toBeGreaterThan(0);
    });
    
    // 첫번째 챌린지 선택
    await act(async () => {
      fireEvent.press(getAllByTestId('challenge-item')[0]);
      await new Promise(resolve => setTimeout(resolve, 200));
    });
    
    // 상세 화면 이동 확인
    expect(mockNavigation.navigate).toHaveBeenCalledWith('ChallengeDetail', {
      challengeId: mockChallenges[0].challenge_id
    });
  });
  
  it('creates a new challenge', async () => {
    const mockNavigation = {
      navigate: jest.fn(),
      goBack: jest.fn()
    };
    
    const { getByText, getByPlaceholderText, getByTestId } = render(
      <CreateChallengeScreen navigation={mockNavigation} />
    );
    
    // 챌린지 정보 입력
    await act(async () => {
      fireEvent.changeText(
        getByPlaceholderText('챌린지 제목'),
        '새로운 챌린지'
      );
      fireEvent.changeText(
        getByPlaceholderText('설명'),
        '테스트 챌린지 설명'
      );
      // 날짜 선택 생략 (React Native DateTimePicker 모킹 복잡)
    });
    
    // 생성 버튼 클릭
    await act(async () => {
      fireEvent.press(getByTestId('create-challenge-button'));
      await new Promise(resolve => setTimeout(resolve, 300));
    });
    
    // 챌린지 생성 API 호출 확인
    expect(mockChallengeService.createChallenge).toHaveBeenCalled();
    // 뒤로가기 호출 확인
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });
  
  it('joins a challenge from detail screen', async () => {
    const route = {
      params: { challengeId: mockChallenges[0].challenge_id }
    };
    const mockNavigation = {
      navigate: jest.fn(),
      goBack: jest.fn()
    };
    
    const { getByText, getByTestId } = render(
      <ChallengeDetailScreen route={route} navigation={mockNavigation} />
    );
    
    // 챌린지 상세 로드 대기
    await waitFor(() => {
      expect(getByText(mockChallenges[0].title)).toBeTruthy();
    });
    
    // 참여 버튼 클릭
    await act(async () => {
      fireEvent.press(getByTestId('join-challenge-button'));
      await new Promise(resolve => setTimeout(resolve, 300));
    });
    
    // 챌린지 참여 API 호출 확인
    expect(mockChallengeService.joinChallenge).toHaveBeenCalledWith(
      mockChallenges[0].challenge_id
    );
    
    // 성공 메시지 확인
    await waitFor(() => {
      expect(getByText('챌린지에 참여했습니다')).toBeTruthy();
    });
  });
});