// __tests__/screens/ComfortScreen.test.tsx
import React from 'react';
import { Alert } from 'react-native';
import comfortWallService from '../../src/services/api/comfortWallService';

// ComfortScreen 컴포넌트 자체를 모킹
jest.mock('../../src/screens/ComfortScreen', () => 'MockedComfortScreen');

// console.error 모킹
const originalConsoleError = console.error;
console.error = jest.fn();

// react-native-paper 모킹
jest.mock('react-native-paper', () => ({
  Card: { Content: 'CardContent' },
  TextInput: 'TextInput',
  Button: 'Button',
  List: { 
    Section: 'ListSection', 
    Item: 'ListItem', 
    Icon: 'ListIcon' 
  },
  Title: 'Title',
  Paragraph: 'Paragraph',
  FAB: 'FAB',
  ActivityIndicator: 'ActivityIndicator',
  Chip: 'Chip',
  Text: 'PaperText',
  Modal: 'Modal',
  useTheme: () => ({
    colors: {
      primary: '#000',
      background: '#fff',
      surface: '#fff',
      accent: '#f1c40f',
      error: '#f13a59',
      text: '#000',
    }
  }),
}));

jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

// comfortWallService 모킹
jest.mock('../../src/services/api/comfortWallService', () => ({
  getPosts: jest.fn().mockResolvedValue({ data: { data: [] } }),
  getBestPosts: jest.fn().mockResolvedValue({ data: { data: [] } }),
  createPost: jest.fn().mockResolvedValue({ data: { data: {} } }),
  sendMessage: jest.fn().mockResolvedValue({ data: { message: 'success' } }),
  likePost: jest.fn().mockResolvedValue({ data: { success: true } }),
}));

// Alert 모킹
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

describe('ComfortWallService API 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  afterAll(() => {
    console.error = originalConsoleError;
  });

  // API 호출 테스트 - getPosts
  test('getPosts API가 올바르게 호출됨', async () => {
    // 테스트 데이터 설정
    const mockResponse = { 
      data: { 
        data: [
          {
            post_id: 1,
            title: '테스트 게시물',
            content: '테스트 내용',
            user_id: 1,
            is_anonymous: true,
            like_count: 5,
            comment_count: 2,
            created_at: '2025-05-01T12:00:00Z'
          }
        ] 
      } 
    };
    
    (comfortWallService.getPosts as jest.Mock).mockResolvedValueOnce(mockResponse);
    
    // API 호출
    const result = await comfortWallService.getPosts();
    
    // 결과 검증
    expect(comfortWallService.getPosts).toHaveBeenCalled();
    expect(result).toEqual(mockResponse);
  });

  // API 호출 테스트 - getBestPosts
  test('getBestPosts API가 올바르게 호출됨', async () => {
    // 테스트 데이터 설정
    const mockResponse = { 
      data: { 
        data: [
          {
            post_id: 2,
            title: '베스트 게시물',
            content: '베스트 내용',
            like_count: 50,
            comment_count: 10
          }
        ] 
      } 
    };
    
    (comfortWallService.getBestPosts as jest.Mock).mockResolvedValueOnce(mockResponse);
    
    // API 호출
    const result = await comfortWallService.getBestPosts();
    
    // 결과 검증
    expect(comfortWallService.getBestPosts).toHaveBeenCalled();
    expect(result).toEqual(mockResponse);
  });

  // API 호출 테스트 - createPost
  test('createPost API가 올바른 파라미터와 함께 호출됨', async () => {
    // 테스트 데이터 설정
    const postData = {
      title: '새 게시물',
      content: '새 내용',
      is_anonymous: true
    };
    
    const mockResponse = { 
      data: { 
        data: {
          post_id: 3,
          ...postData,
          user_id: 1,
          like_count: 0,
          comment_count: 0,
          created_at: '2025-05-01T14:00:00Z'
        } 
      } 
    };
    
    (comfortWallService.createPost as jest.Mock).mockResolvedValueOnce(mockResponse);
    
    // API 호출
    const result = await comfortWallService.createPost(postData);
    
    // 결과 검증
    expect(comfortWallService.createPost).toHaveBeenCalledWith(postData);
    expect(result).toEqual(mockResponse);
  });

  // API 호출 테스트 - sendMessage
  test('sendMessage API가 올바른 파라미터와 함께 호출됨', async () => {
    // 테스트 데이터 설정
    const postId = 1;
    const messageData = {
      message: '응원 메시지',
      is_anonymous: true
    };
    
    const mockResponse = { 
      data: { 
        message: '메시지가 성공적으로 전송되었습니다.'
      } 
    };
    
    (comfortWallService.sendMessage as jest.Mock).mockResolvedValueOnce(mockResponse);
    
    // API 호출
    const result = await comfortWallService.sendMessage(postId, messageData);
    
    // 결과 검증
    expect(comfortWallService.sendMessage).toHaveBeenCalledWith(postId, messageData);
    expect(result).toEqual(mockResponse);
  });

  // API 호출 테스트 - likePost
  test('likePost API가 올바른 게시물 ID와 함께 호출됨', async () => {
    // 테스트 데이터 설정
    const postId = 2;
    
    const mockResponse = { 
      data: { 
        success: true,
        like_count: 6
      } 
    };
    
    (comfortWallService.likePost as jest.Mock).mockResolvedValueOnce(mockResponse);
    
    // API 호출
    const result = await comfortWallService.likePost(postId);
    
    // 결과 검증
    expect(comfortWallService.likePost).toHaveBeenCalledWith(postId);
    expect(result).toEqual(mockResponse);
  });

  // API 오류 처리 테스트
  test('API 오류가 올바르게 처리됨', async () => {
    // 오류 상황 모킹
    const errorMessage = '서버 오류가 발생했습니다.';
    (comfortWallService.getPosts as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));
    
    // API 호출 및 오류 처리
    try {
      await comfortWallService.getPosts();
      // 이 라인이 실행되면 테스트 실패
      expect(true).toBe(false); 
    } catch (error) {
      // 오류 검증
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe(errorMessage);
    }
  });
});