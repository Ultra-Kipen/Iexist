// __tests__/screens/CreateChallengeScreen.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

// DateTimePicker 모킹
jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  return function MockDateTimePicker(props: { children: any; }) {
    return React.createElement('DateTimePicker', props, props.children);
  };
});

// 필요한 모듈 모킹
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: jest.fn(),
    navigate: jest.fn(),
  }),
}));

// challengeService 모킹
const mockCreateChallenge = jest.fn();
jest.mock('../../src/services/api/challengeService', () => ({
  createChallenge: (...args: any) => mockCreateChallenge(...args),
}));

// Alert.alert 모킹
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

// 실제 컴포넌트 임포트는 모킹 후에 해야 함
import CreateChallengeScreen from '../../src/screens/CreateChallengeScreen';

describe('CreateChallengeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateChallenge.mockResolvedValue({
      data: {
        data: {
          challenge_id: 1,
          title: '테스트 챌린지',
          description: '테스트 설명',
          start_date: '2025-04-26',
          end_date: '2025-05-03',
          is_public: true,
        }
      }
    });
  });

  it('submits form successfully', async () => {
    const { getByText, getByPlaceholderText } = render(<CreateChallengeScreen />);
    
    // 폼 입력
    fireEvent.changeText(getByPlaceholderText('챌린지 제목을 입력하세요'), '테스트 챌린지');
    fireEvent.changeText(getByPlaceholderText('챌린지에 대한 설명을 입력하세요'), '테스트 설명');
    
    // 폼 제출
    fireEvent.press(getByText('챌린지 만들기'));
    
    // API 호출 확인
    await waitFor(() => {
      expect(mockCreateChallenge).toHaveBeenCalledWith(expect.objectContaining({
        title: '테스트 챌린지',
        description: '테스트 설명',
      }));
    });
    
    // Alert 호출 검증
    expect(Alert.alert).toHaveBeenCalledWith(
      '챌린지 생성 완료',
      '새로운 챌린지가 생성되었습니다!',
      expect.any(Array)
    );
  });

  it('handles error during submission', async () => {
    mockCreateChallenge.mockRejectedValueOnce(new Error('API 오류'));
    
    const { getByText, getByPlaceholderText } = render(<CreateChallengeScreen />);
    
    // 폼 입력
    fireEvent.changeText(getByPlaceholderText('챌린지 제목을 입력하세요'), '테스트 챌린지');
    fireEvent.changeText(getByPlaceholderText('챌린지에 대한 설명을 입력하세요'), '테스트 설명');
    
    // 폼 제출
    fireEvent.press(getByText('챌린지 만들기'));
    
    // API 호출 확인
    await waitFor(() => {
      expect(mockCreateChallenge).toHaveBeenCalledWith(expect.objectContaining({
        title: '테스트 챌린지',
        description: '테스트 설명',
      }));
    });
    
    // Alert 호출 검증
    expect(Alert.alert).toHaveBeenCalledWith(
      '오류',
      '챌린지 생성 중 문제가 발생했습니다.'
    );
  });

  it('validates form before submission', () => {
    const { getByText } = render(<CreateChallengeScreen />);
    
    // 폼 제출 시도 (입력 없이)
    fireEvent.press(getByText('챌린지 만들기'));
    
    // 에러 메시지 확인
    expect(getByText('제목을 입력해주세요.')).toBeTruthy();
    
    // API가 호출되지 않았는지 확인
    expect(mockCreateChallenge).not.toHaveBeenCalled();
  });
});