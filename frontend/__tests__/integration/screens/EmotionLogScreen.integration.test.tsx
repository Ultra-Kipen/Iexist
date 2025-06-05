import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

// apiClient 모킹 (emotionService 모킹 전에 위치해야 함)
jest.mock('../../../src/services/api/client', () => ({
  get: jest.fn(),
  post: jest.fn(),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() }
  }
}));

// emotionService 모킹
jest.mock('../../../src/services/api/emotionService', () => ({
  getAllEmotions: jest.fn(),
  recordEmotions: jest.fn()
}));

// Alert 모킹
const mockAlert = { alert: jest.fn() };
jest.spyOn(Alert, 'alert').mockImplementation(mockAlert.alert);

// react-native-vector-icons 모킹
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => "MaterialCommunityIcons");

// Paper 컴포넌트 모킹 추가
jest.mock('react-native-paper', () => {
  const React = require('react');
  const { View, Text: RNText } = require('react-native');

  const createComponent = (name) => {
    return ({ children, style, testID, onPress, disabled, ...props }) => (
      <View style={style} testID={testID || name} onPress={onPress} disabled={disabled} {...props}>
        {children}
      </View>
    );
  };

  return {
    Text: ({ children, ...props }) => <RNText {...props}>{children}</RNText>,
    Chip: createComponent('Chip'),
    Button: createComponent('Button'),
    TextInput: createComponent('TextInput'),
    ActivityIndicator: createComponent('ActivityIndicator')
  };
});

// 실제 컴포넌트 임포트
import EmotionLogScreen from '../../../src/screens/EmotionLogScreen';
import emotionService from '../../../src/services/api/emotionService';

// 목 데이터
const mockEmotions = [
  { emotion_id: 1, name: '행복', icon: 'emoticon-happy-outline', color: '#FFD700' },
  { emotion_id: 2, name: '감사', icon: 'hand-heart', color: '#FF69B4' },
];

describe('EmotionLogScreen', () => {
  const mockNavigation = { goBack: jest.fn(), navigate: jest.fn() };
  const mockRoute = { params: {} }; // 추가된 route 프로퍼티

  beforeEach(() => {
    jest.clearAllMocks();
    
    (emotionService.getAllEmotions as jest.Mock).mockResolvedValue({
      data: {
        status: 'success',
        data: mockEmotions
      }
    });
    
    (emotionService.recordEmotions as jest.Mock).mockResolvedValue({});
  });

  // 렌더링 시 route 파라미터 추가
  it('렌더링이 올바르게 됨', async () => {
    const { findByText } = render(<EmotionLogScreen navigation={mockNavigation} route={mockRoute} />);
    
    await findByText('오늘의 감정');
    await findByText('현재 어떤 감정을 느끼고 계신가요?');
  });

  it('모든 감정 칩이 올바르게 렌더링됨', async () => {
    const { findAllByTestId } = render(<EmotionLogScreen navigation={mockNavigation} route={mockRoute} />);
    
    const chips = await findAllByTestId('emotion-chip');
    expect(chips.length).toBe(mockEmotions.length);
  });

  it('감정 칩을 클릭하면 선택 상태가 변경됨', async () => {
    const { findAllByTestId, findByTestId } = render(<EmotionLogScreen navigation={mockNavigation} route={mockRoute} />);
    
    const chips = await findAllByTestId('emotion-chip');
    fireEvent.press(chips[0]);
    
    const submitButton = await findByTestId('emotion-submit-button');
    expect(submitButton.props.disabled).toBeFalsy();
  });
  
  it('여러 감정을 선택할 수 있음', async () => {
    const { findAllByTestId, findByTestId } = render(<EmotionLogScreen navigation={mockNavigation} route={mockRoute} />);
    
    const chips = await findAllByTestId('emotion-chip');
    fireEvent.press(chips[0]);
    fireEvent.press(chips[1]);
    
    const submitButton = await findByTestId('emotion-submit-button');
    expect(submitButton.props.disabled).toBeFalsy();
  });

  it('메모 입력이 가능함', async () => {
    const { findByTestId } = render(<EmotionLogScreen navigation={mockNavigation} route={mockRoute} />);
    
    const noteInput = await findByTestId('emotion-note-input');
    expect(noteInput).toBeTruthy();
    
    fireEvent.changeText(noteInput, '오늘은 정말 좋은 하루였습니다.');
  });

  it('감정 기록 제출 성공 시 확인 메시지와 화면 이동이 동작함', async () => {
    const { findAllByTestId, findByTestId } = render(<EmotionLogScreen navigation={mockNavigation} route={mockRoute} />);
    
    const chips = await findAllByTestId('emotion-chip');
    fireEvent.press(chips[0]);
    
    const submitButton = await findByTestId('emotion-submit-button');
    fireEvent.press(submitButton);
    
    // 비동기 작업이 완료될 때까지 기다림
    await waitFor(() => {
      expect(emotionService.recordEmotions).toHaveBeenCalled();
    });
    
    expect(mockAlert.alert).toHaveBeenCalled();
    
    // Alert의 콜백 함수를 수동으로 호출
    const alertCall = mockAlert.alert.mock.calls[0];
    if (alertCall && alertCall[2] && alertCall[2][0] && alertCall[2][0].onPress) {
      alertCall[2][0].onPress();
    }
    
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  it('감정 기록 제출 실패 시 에러 메시지가 표시됨', async () => {
    (emotionService.recordEmotions as jest.Mock).mockRejectedValueOnce({
      response: { data: { message: '감정 기록 실패' } }
    });
    
    const { findAllByTestId, findByTestId } = render(<EmotionLogScreen navigation={mockNavigation} route={mockRoute} />);
    
    const chips = await findAllByTestId('emotion-chip');
    fireEvent.press(chips[0]);
    
    const submitButton = await findByTestId('emotion-submit-button');
    fireEvent.press(submitButton);
    
    // 비동기 작업이 완료될 때까지 기다림
    await waitFor(() => {
      expect(emotionService.recordEmotions).toHaveBeenCalled();
    });
    
    expect(mockAlert.alert).toHaveBeenCalledWith('오류', '감정 기록 실패');
  });

  it('감정을 선택했다가 다시 클릭하면 선택이 해제됨', async () => {
    const { findAllByTestId, findByTestId } = render(<EmotionLogScreen navigation={mockNavigation} route={mockRoute} />);
    
    const chips = await findAllByTestId('emotion-chip');
    fireEvent.press(chips[0]);
    
    const submitButton = await findByTestId('emotion-submit-button');
    expect(submitButton.props.disabled).toBeFalsy();
    
    fireEvent.press(chips[0]);
    
    // DOM 업데이트를 기다림
    await waitFor(() => {
      expect(submitButton.props.disabled).toBeTruthy();
    });
  });
});