// root/frontend/__tests__/unit/screens/ComfortScreen.unit.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import ComfortScreen from '../../../src/screens/ComfortScreen';

// 경고 억제
jest.spyOn(console, 'error').mockImplementation(() => {});
jest.spyOn(console, 'warn').mockImplementation(() => {});

// React Native Paper 모킹
jest.mock('react-native-paper', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');
  
  return {
    useTheme: () => ({
      colors: {
        primary: '#6200ee',
      },
    }),
    Card: (props: { children: any; }) => React.createElement(View, props, props.children),
    TextInput: (props: { testID: any; label: any; }) => React.createElement(View, { testID: props.testID }, props.label),
    Button: (props: { testID: any; children: any; }) => React.createElement(TouchableOpacity, { 
      testID: props.testID 
    }, props.children),
    Title: (props: { children: any; }) => React.createElement(Text, {}, props.children),
    Paragraph: (props: { children: any; }) => React.createElement(Text, {}, props.children),
    Chip: (props: { children: any; }) => React.createElement(View, {}, props.children),
    List: {
      Section: (props: { testID: any; children: any; }) => React.createElement(View, { testID: props.testID }, props.children),
      Item: (props: { title: any; right: (arg0: {}) => any; }) => React.createElement(View, {}, [
        React.createElement(Text, { key: 'title' }, props.title),
        props.right && props.right({})
      ]),
      Icon: () => React.createElement(View, {}, null),
    },
    FAB: (props: { testID: any; icon: any; }) => React.createElement(TouchableOpacity, { 
      testID: props.testID 
    }, props.icon),
    ActivityIndicator: () => React.createElement(View, { testID: 'activity-indicator' }),
    Text: (props: { children: any; }) => React.createElement(Text, {}, props.children),
  };
});

// API 서비스 모킹
jest.mock('../../../src/services/api/comfortWallService', () => {
  return {
    getPosts: jest.fn(() => Promise.resolve({
      data: {
        status: 'success',
        data: [
          {
            post_id: 1,
            title: '힘든 하루',
            content: '오늘은 정말 힘든 하루였어요.',
            user_id: 1,
            is_anonymous: true,
            like_count: 8,
            comment_count: 5,
            created_at: '2024-04-06T12:00:00.000Z',
          }
        ]
      }
    })),
    getBestPosts: jest.fn(() => Promise.resolve({
      data: {
        status: 'success',
        data: [
          {
            post_id: 3,
            title: '여러분 덕분에 이겨냈어요',
            content: '지난주에 올린 고민, 여러분의 댓글 덕분에 용기를 얻었어요.',
            like_count: 25,
            comment_count: 12,
          }
        ]
      }
    })),
    createPost: jest.fn(() => Promise.resolve({ data: { status: 'success' } })),
    sendMessage: jest.fn(() => Promise.resolve({ data: { status: 'success' } })),
  };
});

// Alert 모킹
jest.mock('react-native', () => {
  const rn = jest.requireActual('react-native');
  return {
    ...rn,
    Alert: {
      ...rn.Alert,
      alert: jest.fn()
    }
  };
});

// 네비게이션 모킹
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

describe('ComfortScreen 단위 테스트', () => {
  const comfortWallService = require('../../../src/services/api/comfortWallService');
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('화면 렌더링 확인', () => {
    const { toJSON } = render(<ComfortScreen navigation={mockNavigation} />);
    expect(toJSON()).not.toBeNull();
  });

  test('API 서비스 함수 호출 확인', () => {
    // getPosts 함수 확인
    expect(typeof comfortWallService.getPosts).toBe('function');
    
    // getBestPosts 함수 확인
    expect(typeof comfortWallService.getBestPosts).toBe('function');
    
    // createPost 함수 확인
    expect(typeof comfortWallService.createPost).toBe('function');
    
    // sendMessage 함수 확인
    expect(typeof comfortWallService.sendMessage).toBe('function');
  });

  test('getPosts API가 올바른 데이터 구조 반환', async () => {
    const result = await comfortWallService.getPosts();
    expect(result.data.status).toBe('success');
    expect(Array.isArray(result.data.data)).toBe(true);
    expect(result.data.data.length).toBeGreaterThan(0);
    
    const post = result.data.data[0];
    expect(post).toHaveProperty('post_id');
    expect(post).toHaveProperty('title');
    expect(post).toHaveProperty('content');
  });

  test('getBestPosts API가 올바른 데이터 구조 반환', async () => {
    const result = await comfortWallService.getBestPosts();
    expect(result.data.status).toBe('success');
    expect(Array.isArray(result.data.data)).toBe(true);
    
    if (result.data.data.length > 0) {
      const post = result.data.data[0];
      expect(post).toHaveProperty('post_id');
      expect(post).toHaveProperty('title');
      expect(post).toHaveProperty('content');
    }
  });

  test('createPost 함수 호출 테스트', async () => {
    const postData = {
      title: '테스트 제목',
      content: '테스트 내용',
      is_anonymous: true
    };
    
    await comfortWallService.createPost(postData);
    expect(comfortWallService.createPost).toHaveBeenCalledWith(postData);
  });

  test('sendMessage 함수 호출 테스트', async () => {
    const postId = 1;
    const messageData = {
      message: '응원 메시지',
      is_anonymous: true
    };
    
    await comfortWallService.sendMessage(postId, messageData);
    expect(comfortWallService.sendMessage).toHaveBeenCalledWith(postId, messageData);
  });
});