import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text, View } from 'react-native';

// 테스트용 팩토리
const createTestProps = (props: any = {}) => ({
  navigation: {
    navigate: jest.fn(),
  },
  ...props,
});

// TypeScript 인터페이스 정의 (중요)
interface MockComponentType extends React.FC<any> {
  Content?: React.FC<any>;
  Actions?: React.FC<any>;
  Item?: React.FC<any>;
  Icon?: React.FC<any>;
}

// React Native Paper 모킹
jest.mock('react-native-paper', () => {
  const React = require('react');
  const { Text, View } = require('react-native');
  
  // 모킹 컴포넌트 팩토리 함수
  const createMockComponent = (displayName: string): MockComponentType => {
    const MockComponent: MockComponentType = ({ children, title, ...rest }) => {
      if (title) {
        return React.createElement(Text, { testID: `${displayName}-title` }, title);
      }
      return React.createElement(Text, { testID: displayName }, children);
    };
    
    MockComponent.displayName = displayName;
    return MockComponent;
  };
  
  // 중첩 컴포넌트 생성
  const Card: MockComponentType = createMockComponent('Card');
  Card.Content = createMockComponent('Card.Content');
  Card.Actions = createMockComponent('Card.Actions');
  
  // 기본 컴포넌트
  const Title = createMockComponent('Title');
  const Paragraph = createMockComponent('Paragraph');
  const Button: MockComponentType = ({ children, onPress }) => 
    React.createElement(Text, { testID: 'Button', onPress }, children);
  const ProgressBar = () => React.createElement(View, { testID: 'ProgressBar' });
  
  // 복합 컴포넌트
  const List: { [key: string]: MockComponentType } = {
    Item: ({ title, left }) => React.createElement(Text, { testID: 'List.Item' }, title),
    Icon: ({ icon }) => React.createElement(Text, { testID: 'List.Icon' }, icon),
  };
  
  return {
    Card,
    Title,
    Paragraph,
    Button,
    ProgressBar,
    useTheme: () => ({
      colors: {
        primary: '#6200ee',
        background: '#ffffff',
      },
    }),
    Provider: ({ children }) => React.createElement(View, { testID: 'Provider' }, children),
    List,
  };
});

// ChallengeScreen 컴포넌트 임포트
import ChallengeScreen from '../../../src/screens/ChallengeScreen';

// 콘솔 로그 모킹
const mockConsoleLog = jest.fn();
console.log = mockConsoleLog;

// 테스트 시작
describe('ChallengeScreen', () => {
  let props: any;
  let component: any;
  
  beforeEach(() => {
    props = createTestProps();
    component = render(<ChallengeScreen {...props} />);
    mockConsoleLog.mockClear();
  });
  
  it('renders correctly', () => {
    expect(component).toBeTruthy();
  });

  it('displays challenge titles', () => {
    const { queryAllByText } = component;
    
    // 제목 확인
    expect(queryAllByText('7일간의 감사 일기').length).toBeGreaterThan(0);
    expect(queryAllByText('30일 긍정 에너지 나누기').length).toBeGreaterThan(0);
    expect(queryAllByText('21일 명상 습관 만들기').length).toBeGreaterThan(0);
  });
  
  it('displays challenge descriptions', () => {
    const { queryAllByText } = component;
    
    // 설명 확인
    expect(queryAllByText('매일 감사한 일 3가지를 기록해보세요.').length).toBeGreaterThan(0);
    expect(queryAllByText('하루에 한 번 주변 사람에게 긍정적인 말을 해보세요.').length).toBeGreaterThan(0);
    expect(queryAllByText('매일 10분씩 명상을 하고 느낀 점을 공유해보세요.').length).toBeGreaterThan(0);
  });
  
  it('displays participant counts correctly', () => {
    const { queryAllByText } = component;
    
    // 참여자 수 확인
    expect(queryAllByText('참여자: 128명').length).toBeGreaterThan(0);
    expect(queryAllByText('참여자: 56명').length).toBeGreaterThan(0);
    expect(queryAllByText('참여자: 89명').length).toBeGreaterThan(0);
  });
  
  it('displays challenge durations correctly', () => {
    const { queryAllByText } = component;
    
    // 기간 확인
    expect(queryAllByText('기간: 7일').length).toBeGreaterThan(0);
    expect(queryAllByText('기간: 30일').length).toBeGreaterThan(0);
    expect(queryAllByText('기간: 21일').length).toBeGreaterThan(0);
  });
  
  it('displays progress percentages correctly', () => {
    const { queryAllByText } = component;
    
    // 진행률 확인
    expect(queryAllByText('40% 완료').length).toBeGreaterThan(0);
    expect(queryAllByText('20% 완료').length).toBeGreaterThan(0);
    expect(queryAllByText('60% 완료').length).toBeGreaterThan(0);
  });
  
  it('calls handleJoinChallenge with correct ID when button is pressed', () => {
    const { queryAllByText } = component;
    
    // 참여하기 버튼 가져오기
    const joinButtons = queryAllByText('참여하기');
    expect(joinButtons.length).toBe(3);
    
    // 버튼 클릭 테스트
    fireEvent.press(joinButtons[0]);
    expect(mockConsoleLog).toHaveBeenCalledWith('Joining challenge:', 1);
    
    fireEvent.press(joinButtons[1]);
    expect(mockConsoleLog).toHaveBeenCalledWith('Joining challenge:', 2);
    
    fireEvent.press(joinButtons[2]);
    expect(mockConsoleLog).toHaveBeenCalledWith('Joining challenge:', 3);
  });
  
  it('displays the header text correctly', () => {
    const { queryAllByText } = component;
    
    // 헤더 텍스트 확인
    expect(queryAllByText('현재 진행 중인 챌린지').length).toBeGreaterThan(0);
  });
});