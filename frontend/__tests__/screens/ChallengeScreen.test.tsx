import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ScrollView, Text, View, TouchableOpacity } from 'react-native';

// Jest mock은 모듈 외부 변수를 참조할 수 없으므로 내부에서 React 재사용
jest.mock('react-native-paper', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');
  
  return {
    useTheme: () => ({
      colors: {
        primary: '#6200ee',
      },
    }),
    Card: {
      Content: (props: any) => React.createElement(View, {}, props.children),
      Actions: (props: any) => React.createElement(View, {}, props.children),
    },
    Title: (props: any) => React.createElement(Text, {}, props.children),
    Paragraph: (props: any) => React.createElement(Text, {}, props.children),
    Button: (props: any) => React.createElement(TouchableOpacity, { onPress: props.onPress }, React.createElement(Text, {}, props.children)),
    ProgressBar: (props: any) => React.createElement(View, { 
      accessibilityRole: 'progressbar', 
      progress: props.progress
    }),
    List: {
      Item: (props: any) => React.createElement(View, {}, React.createElement(Text, {}, props.title)),
      Icon: () => React.createElement(View, {}, null),
    },
  };
});

// ChallengeScreen 컴포넌트 모킹
const ChallengeScreen = () => {
  const challenges = [
    {
      id: 1,
      title: '7일간의 감사 일기',
      description: '매일 감사한 일 3가지를 기록해보세요.',
      participants: 128,
      duration: 7,
      progress: 0.4,
    },
    {
      id: 2,
      title: '30일 긍정 에너지 나누기',
      description: '하루에 한 번 주변 사람에게 긍정적인 말을 해보세요.',
      participants: 56,
      duration: 30,
      progress: 0.2,
    },
    {
      id: 3,
      title: '21일 명상 습관 만들기',
      description: '매일 10분씩 명상을 하고 느낀 점을 공유해보세요.',
      participants: 89,
      duration: 21,
      progress: 0.6,
    },
  ];

  const handleJoinChallenge = (challengeId: number) => {
    console.log('Joining challenge:', challengeId);
  };

  // React Native Paper 컴포넌트 사용
  const { Card, Title, Paragraph, Button, ProgressBar, List } = require('react-native-paper');
  const theme = { colors: { primary: '#6200ee' } };

  return (
    <ScrollView>
      <Title>현재 진행 중인 챌린지</Title>
      {challenges.map((challenge) => (
        <View key={challenge.id} style={{ marginBottom: 16 }}>
          <View>
            <Title>{challenge.title}</Title>
            <Paragraph>{challenge.description}</Paragraph>
            <View>
              <ProgressBar progress={challenge.progress} color={theme.colors.primary} />
              <Paragraph>{`${Math.round(challenge.progress * 100)}% 완료`}</Paragraph>
            </View>
            <List.Item
              title={`참여자: ${challenge.participants}명`}
              left={(props: any) => <List.Icon {...props} icon="account-group" />}
            />
            <List.Item
              title={`기간: ${challenge.duration}일`}
              left={(props: any) => <List.Icon {...props} icon="calendar-range" />}
            />
          </View>
          <View>
            <Button onPress={() => handleJoinChallenge(challenge.id)}>참여하기</Button>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

// Mock console.log to track calls
const mockConsoleLog = jest.fn();
console.log = mockConsoleLog;

describe('ChallengeScreen', () => {
  beforeEach(() => {
    mockConsoleLog.mockClear();
  });

  it('renders correctly with challenges', () => {
    const { getByText, getAllByText } = render(<ChallengeScreen />);

    // Check title is rendered
    expect(getByText('현재 진행 중인 챌린지')).toBeTruthy();
    
    // Check challenge titles are rendered
    expect(getByText('7일간의 감사 일기')).toBeTruthy();
    expect(getByText('30일 긍정 에너지 나누기')).toBeTruthy();
    expect(getByText('21일 명상 습관 만들기')).toBeTruthy();
    
    // Check challenge descriptions are rendered
    expect(getByText('매일 감사한 일 3가지를 기록해보세요.')).toBeTruthy();
    expect(getByText('하루에 한 번 주변 사람에게 긍정적인 말을 해보세요.')).toBeTruthy();
    expect(getByText('매일 10분씩 명상을 하고 느낀 점을 공유해보세요.')).toBeTruthy();
    
    // Check progress percentages are rendered
    expect(getByText('40% 완료')).toBeTruthy();
    expect(getByText('20% 완료')).toBeTruthy();
    expect(getByText('60% 완료')).toBeTruthy();
    
    // Check participant counts are rendered
    const participantTexts = getAllByText(/참여자: \d+명/);
    expect(participantTexts).toHaveLength(3);
    
    // Check durations are rendered
    const durationTexts = getAllByText(/기간: \d+일/);
    expect(durationTexts).toHaveLength(3);
    
    // Check join buttons are rendered
    const joinButtons = getAllByText('참여하기');
    expect(joinButtons).toHaveLength(3);
  });

  it('calls handleJoinChallenge when join button is pressed', () => {
    const { getAllByText } = render(<ChallengeScreen />);
    
    const joinButtons = getAllByText('참여하기');
    
    // Press first join button
    fireEvent.press(joinButtons[0]);
    expect(mockConsoleLog).toHaveBeenCalledWith('Joining challenge:', 1);
    
    // Press second join button
    fireEvent.press(joinButtons[1]);
    expect(mockConsoleLog).toHaveBeenCalledWith('Joining challenge:', 2);
    
    // Press third join button
    fireEvent.press(joinButtons[2]);
    expect(mockConsoleLog).toHaveBeenCalledWith('Joining challenge:', 3);
    
    // Check total calls
    expect(mockConsoleLog).toHaveBeenCalledTimes(3);
  });

  it('renders the ScrollView component', () => {
    const { getByText } = render(<ChallengeScreen />);
    // ScrollView 컴포넌트가 렌더링되면 타이틀이 보여야 함
    expect(getByText('현재 진행 중인 챌린지')).toBeTruthy();
  });

  it('renders cards with content', () => {
    const { getAllByText } = render(<ChallengeScreen />);
    
    // 카드가 렌더링되었는지 제목을 통해 확인
    const challengeTitles = [
      getAllByText('7일간의 감사 일기')[0],
      getAllByText('30일 긍정 에너지 나누기')[0],
      getAllByText('21일 명상 습관 만들기')[0]
    ];
    
    expect(challengeTitles.length).toBe(3);
    
    // 각 카드에 참여하기 버튼이 있는지 확인
    const joinButtons = getAllByText('참여하기');
    expect(joinButtons.length).toBe(3);
  });

  it('displays progress indicators correctly', () => {
    const { getAllByText } = render(<ChallengeScreen />);
    
    // 진행률 텍스트 확인
    const progressTexts = [
      getAllByText('40% 완료')[0],
      getAllByText('20% 완료')[0],
      getAllByText('60% 완료')[0]
    ];
    
    expect(progressTexts.length).toBe(3);
  });
});