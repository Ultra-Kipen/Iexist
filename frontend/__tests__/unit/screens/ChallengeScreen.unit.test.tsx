import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider as PaperProvider } from 'react-native-paper';
// ChallengeScreen 컴포넌트 임포트
import ChallengeScreen from '../../../src/screens/ChallengeScreen';
// React Native Paper 모킹
jest.mock('react-native-paper', () => {
  const originalModule = jest.requireActual('react-native-paper');
  return {
    ...originalModule,
    useTheme: () => ({
      colors: {
        primary: '#6200ee',
        background: '#ffffff',
      },
    }),
    Provider: function Provider({ children }: { children: React.ReactNode }): React.ReactNode { 
      return children; 
    },
    List: {
      Item: function Item(props: { title: string; left?: (props: { color: string; size: number }) => React.ReactNode }) { 
        const { title } = props;
        return <originalModule.Text>{title}</originalModule.Text>; 
      },
      Icon: function Icon(props: { icon: string }) { 
        return <originalModule.Text>{props.icon}</originalModule.Text>; 
      }
    },
  };
});

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <PaperProvider>
      {component}
    </PaperProvider>
  );
};
// handleJoinChallenge 함수의 호출을 모니터링하기 위한 모킹
const mockConsoleLog = jest.fn();
console.log = mockConsoleLog;

describe('ChallengeScreen 단위 테스트', () => {
  beforeEach(() => {
    mockConsoleLog.mockClear();
  });

  test('각 챌린지의 제목이 올바르게 표시되는지 확인', () => {
   
    
    const { getByText } = renderWithProvider(<ChallengeScreen />);
    expect(getByText('7일간의 감사 일기')).toBeTruthy();
    expect(getByText('30일 긍정 에너지 나누기')).toBeTruthy();
    expect(getByText('21일 명상 습관 만들기')).toBeTruthy();
  });
  
  test('각 챌린지의 설명이 올바르게 표시되는지 확인', () => {
    const { getByText } = renderWithProvider(<ChallengeScreen />);
    
    expect(getByText('매일 감사한 일 3가지를 기록해보세요.')).toBeTruthy();
    expect(getByText('하루에 한 번 주변 사람에게 긍정적인 말을 해보세요.')).toBeTruthy();
    expect(getByText('매일 10분씩 명상을 하고 느낀 점을 공유해보세요.')).toBeTruthy();
  });
  
  test('각 챌린지의 참여자 수가 올바르게 표시되는지 확인', () => {
    const { getByText } = renderWithProvider(<ChallengeScreen />);
    
    expect(getByText('참여자: 128명')).toBeTruthy();
    expect(getByText('참여자: 56명')).toBeTruthy();
    expect(getByText('참여자: 89명')).toBeTruthy();
  });
  
  test('각 챌린지의 기간이 올바르게 표시되는지 확인', () => {
    const { getByText } = renderWithProvider(<ChallengeScreen />);
    
    expect(getByText('기간: 7일')).toBeTruthy();
    expect(getByText('기간: 30일')).toBeTruthy();
    expect(getByText('기간: 21일')).toBeTruthy();
  });
  
  test('각 챌린지의 진행률이 올바르게 표시되는지 확인', () => {
    const { getByText } = renderWithProvider(<ChallengeScreen />);
    
    expect(getByText('40% 완료')).toBeTruthy();
    expect(getByText('20% 완료')).toBeTruthy();
    expect(getByText('60% 완료')).toBeTruthy();
  });
  
  test('참여하기 버튼이 올바르게 동작하는지 확인', () => {
    const { getAllByText } = renderWithProvider(<ChallengeScreen />);
    
    const joinButtons = getAllByText('참여하기');
    expect(joinButtons).toHaveLength(3);
    
    // 첫 번째 버튼 클릭
    fireEvent.press(joinButtons[0]);
    expect(mockConsoleLog).toHaveBeenCalledWith('Joining challenge:', 1);
    
    // 두 번째 버튼 클릭
    fireEvent.press(joinButtons[1]);
    expect(mockConsoleLog).toHaveBeenCalledWith('Joining challenge:', 2);
    
    // 세 번째 버튼 클릭
    fireEvent.press(joinButtons[2]);
    expect(mockConsoleLog).toHaveBeenCalledWith('Joining challenge:', 3);
    
    expect(mockConsoleLog).toHaveBeenCalledTimes(3);
  });
  
  test('진행률이 올바르게 표시되는지 확인', () => {
    const { getAllByText } = renderWithProvider(<ChallengeScreen />);
    
    // 진행률 텍스트 확인
    const progressTexts = [
      getAllByText('40% 완료')[0],
      getAllByText('20% 완료')[0],
      getAllByText('60% 완료')[0]
    ];
    
    expect(progressTexts.length).toBe(3);
  });
  
  test('핸들러 함수가 올바른 챌린지 ID를 전달받는지 확인', () => {
    const { getAllByText } = renderWithProvider(<ChallengeScreen />);
    
    const joinButtons = getAllByText('참여하기');
    
    // 각 버튼 클릭 시 올바른 ID가 전달되는지 확인
    fireEvent.press(joinButtons[0]);
    expect(mockConsoleLog).toHaveBeenLastCalledWith('Joining challenge:', 1);
    
    fireEvent.press(joinButtons[1]);
    expect(mockConsoleLog).toHaveBeenLastCalledWith('Joining challenge:', 2);
    
    fireEvent.press(joinButtons[2]);
    expect(mockConsoleLog).toHaveBeenLastCalledWith('Joining challenge:', 3);
  });
  
  test('컴포넌트 렌더링 시 헤더 텍스트가 표시되는지 확인', () => {
    const { getByText } = renderWithProvider(<ChallengeScreen />);
    expect(getByText('현재 진행 중인 챌린지')).toBeTruthy();
  });
  
  test('모든 챌린지 카드의 정보가 한 번에 표시되는지 확인', () => {
    const { getByText } = renderWithProvider(<ChallengeScreen />);
    
    // 모든 챌린지 정보 확인
    // 첫 번째 챌린지
    expect(getByText('7일간의 감사 일기')).toBeTruthy();
    expect(getByText('매일 감사한 일 3가지를 기록해보세요.')).toBeTruthy();
    expect(getByText('40% 완료')).toBeTruthy();
    expect(getByText('참여자: 128명')).toBeTruthy();
    expect(getByText('기간: 7일')).toBeTruthy();
    
    // 두 번째 챌린지
    expect(getByText('30일 긍정 에너지 나누기')).toBeTruthy();
    expect(getByText('하루에 한 번 주변 사람에게 긍정적인 말을 해보세요.')).toBeTruthy();
    expect(getByText('20% 완료')).toBeTruthy();
    expect(getByText('참여자: 56명')).toBeTruthy();
    expect(getByText('기간: 30일')).toBeTruthy();
    
    // 세 번째 챌린지
    expect(getByText('21일 명상 습관 만들기')).toBeTruthy();
    expect(getByText('매일 10분씩 명상을 하고 느낀 점을 공유해보세요.')).toBeTruthy();
    expect(getByText('60% 완료')).toBeTruthy();
    expect(getByText('참여자: 89명')).toBeTruthy();
    expect(getByText('기간: 21일')).toBeTruthy();
  });
});