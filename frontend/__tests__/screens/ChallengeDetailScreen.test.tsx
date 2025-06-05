// __tests__/screens/ChallengeDetailScreen.test.tsx
import React from 'react';
import { render, act, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert, Text } from 'react-native';
import ChallengeDetailScreen from '../../src/screens/ChallengeDetailScreen';

// 필요한 모듈 모킹
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: { challengeId: 1 },
  }),
}));

// 서비스 모킹
const mockGetChallengeDetails = jest.fn();
const mockParticipateInChallenge = jest.fn();
const mockLeaveChallenge = jest.fn();
const mockUpdateChallengeProgress = jest.fn();
const mockGetAllEmotions = jest.fn();

jest.mock('../../src/services/api/challengeService', () => ({
  getChallengeDetails: (...args) => mockGetChallengeDetails(...args),
  participateInChallenge: (...args) => mockParticipateInChallenge(...args),
  leaveChallenge: (...args) => mockLeaveChallenge(...args),
  updateChallengeProgress: (...args) => mockUpdateChallengeProgress(...args),
}));

jest.mock('../../src/services/api/emotionService', () => ({
  getAllEmotions: (...args) => mockGetAllEmotions(...args),
}));

// Button 컴포넌트 모킹 - 텍스트가 직접 보이도록 모킹
jest.mock('../../src/components/Button', () => {
  // eslint-disable-next-line react/display-name
  return ({ title, onPress }) => {
    const MockText = require('react-native').Text;
    return <MockText onPress={onPress}>{title}</MockText>;
  };
});

// Alert.alert 모킹
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

describe('ChallengeDetailScreen', () => {
  // 기본 응답 데이터 준비
  const mockChallenge = {
    data: {
      data: {
        challenge_id: 1,
        title: '7일간의 감사 일기',
        description: '매일 감사한 일 3가지를 기록해보세요.',
        start_date: '2025-04-01',
        end_date: '2025-04-30',
        is_public: true,
        max_participants: null,
        participant_count: 10,
        creator: {
          user_id: 1,
          username: 'creator',
          nickname: 'Creator',
        },
        is_participating: false,
        created_at: '2025-03-25T00:00:00.000Z',
        participants: [
          {
            user_id: 2,
            username: 'user1',
            nickname: 'User1',
            profile_image_url: null,
          },
        ],
        progress_entries: [],
      }
    }
  };

  const mockEmotions = {
    data: {
      data: [
        { emotion_id: 1, name: '행복', icon: 'emoticon-happy-outline', color: '#FFD700' },
        { emotion_id: 2, name: '감사', icon: 'hand-heart', color: '#FF69B4' },
      ]
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // 기본 모킹 설정
    mockGetChallengeDetails.mockResolvedValue(mockChallenge);
    mockGetAllEmotions.mockResolvedValue(mockEmotions);
    mockParticipateInChallenge.mockResolvedValue({ data: { success: true } });
    mockLeaveChallenge.mockResolvedValue({ data: { success: true } });
    mockUpdateChallengeProgress.mockResolvedValue({ data: { success: true } });
  });

  it('renders challenge details correctly', async () => {
    const { getByText } = render(<ChallengeDetailScreen />);
    
    // 데이터 로딩이 완료될 때까지 대기
    await waitFor(() => expect(mockGetChallengeDetails).toHaveBeenCalledTimes(1), { timeout: 5000 });
    
    // 비동기 작업 완료 후 UI 업데이트 대기
    await waitFor(() => expect(getByText('7일간의 감사 일기')).toBeTruthy(), { timeout: 5000 });
    expect(getByText('매일 감사한 일 3가지를 기록해보세요.')).toBeTruthy();
    await waitFor(() => expect(getByText('챌린지 참여하기')).toBeTruthy(), { timeout: 5000 });
  }, 30000);

  it('handles error state', async () => {
    mockGetChallengeDetails.mockRejectedValueOnce(new Error('API 오류'));
    
    const { getByText } = render(<ChallengeDetailScreen />);
    
    // 에러 상태가 표시될 때까지 대기
    await waitFor(() => expect(mockGetChallengeDetails).toHaveBeenCalledTimes(1), { timeout: 5000 });
    await waitFor(() => expect(getByText('챌린지 정보를 불러오는 중 오류가 발생했습니다.')).toBeTruthy(), { timeout: 5000 });
    await waitFor(() => expect(getByText('다시 시도')).toBeTruthy(), { timeout: 5000 });
  }, 30000);

  it('handles participation toggle', async () => {
    const { getByText } = render(<ChallengeDetailScreen />);
    
    // 데이터 로딩이 완료될 때까지 대기
    await waitFor(() => expect(mockGetChallengeDetails).toHaveBeenCalledTimes(1), { timeout: 5000 });
    
    // 참여 버튼이 렌더링될 때까지 대기
    await waitFor(() => expect(getByText('챌린지 참여하기')).toBeTruthy(), { timeout: 5000 });
    
    // 참여 버튼 클릭
    fireEvent.press(getByText('챌린지 참여하기'));
    
    // API 호출 확인
    await waitFor(() => expect(mockParticipateInChallenge).toHaveBeenCalledWith(1), { timeout: 5000 });
    expect(Alert.alert).toHaveBeenCalledWith('성공', '챌린지에 참여했습니다.');
  }, 30000);

  it('renders the record emotion button when participating', async () => {
    // 참여 중인 챌린지로 설정 (active 상태)
    const currentDate = new Date();
    const futureDate = new Date();
    futureDate.setDate(currentDate.getDate() + 30); // 30일 후 날짜

    mockGetChallengeDetails.mockResolvedValueOnce({
      data: {
        data: {
          ...mockChallenge.data.data,
          is_participating: true,
          end_date: futureDate.toISOString().split('T')[0] // 종료되지 않은 챌린지로 설정
        }
      }
    });
    
    const { getByText } = render(<ChallengeDetailScreen />);
    
    // 화면이 로드되고 참여 중인 상태의 UI가 표시될 때까지 대기
    await waitFor(() => expect(getByText('챌린지 나가기')).toBeTruthy(), { timeout: 5000 });
    
    // 감정 기록하기 버튼 확인
    await waitFor(() => expect(getByText('감정 기록하기')).toBeTruthy(), { timeout: 5000 });
  }, 30000);
});