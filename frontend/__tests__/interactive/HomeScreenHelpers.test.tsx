// HomeScreenHelpers.test.tsx - 홈 스크린 헬퍼 함수 테스트

// client.ts 모듈을 먼저 모킹하여 interceptors 문제 해결
jest.mock('../../src/services/api/client', () => {
  return {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: {
        use: jest.fn(),
        eject: jest.fn()
      },
      response: {
        use: jest.fn(),
        eject: jest.fn()
      }
    }
  };
});

// AsyncStorage 모킹 추가
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve('test_token')),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve())
}));

import React from 'react';
import { 
  handlePostSubmission, 
  handleImageUploadAction, 
  handleLikeAction, 
  handleCommentAction, 
  Emotion, 
  Post, 
  Comment 
} from '../../src/screens/HomeScreen';

describe('HomeScreen Helper Functions', () => {
  // 타이머 함수 모킹 설정 추가
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });
  
  // handlePostSubmission 테스트
  describe('handlePostSubmission', () => {
    it('returns true when content and emotion are provided', () => {
      const content = '테스트 게시물';
      const emotion: Emotion = { label: '행복', icon: 'emoticon-happy-outline', color: '#FFD700' };
      const imageUrl = '';
      const setIsLoading = jest.fn();
      const setIsDialogVisible = jest.fn();
      
      const result = handlePostSubmission(content, emotion, imageUrl, setIsLoading, setIsDialogVisible);
      
      expect(result).toBe(true);
      expect(setIsLoading).toHaveBeenCalledWith(true);
      
      // 비동기 작업 확인
      jest.advanceTimersByTime(1000);
      expect(setIsLoading).toHaveBeenCalledWith(false);
      expect(setIsDialogVisible).toHaveBeenCalledWith(true);
    });
    
    it('returns false when content is empty', () => {
      const content = '';
      const emotion: Emotion = { label: '행복', icon: 'emoticon-happy-outline', color: '#FFD700' };
      const imageUrl = '';
      const setIsLoading = jest.fn();
      const setIsDialogVisible = jest.fn();
      
      const result = handlePostSubmission(content, emotion, imageUrl, setIsLoading, setIsDialogVisible);
      
      expect(result).toBe(false);
      expect(setIsLoading).not.toHaveBeenCalled();
      expect(setIsDialogVisible).not.toHaveBeenCalled();
    });
    
    it('returns false when emotion is null', () => {
      const content = '테스트 게시물';
      const emotion = null;
      const imageUrl = '';
      const setIsLoading = jest.fn();
      const setIsDialogVisible = jest.fn();
      
      const result = handlePostSubmission(content, emotion, imageUrl, setIsLoading, setIsDialogVisible);
      
      expect(result).toBe(false);
      expect(setIsLoading).not.toHaveBeenCalled();
      expect(setIsDialogVisible).not.toHaveBeenCalled();
    });
  });
  
  // handleImageUploadAction 테스트
  describe('handleImageUploadAction', () => {
    it('sets image URL', () => {
      const setImageUrl = jest.fn();
      
      handleImageUploadAction(setImageUrl);
      
      expect(setImageUrl).toHaveBeenCalledWith('https://via.placeholder.com/150');
    });
  });
  
  // handleLikeAction 테스트
  describe('handleLikeAction', () => {
    it('increments like count for the specified post', () => {
      const initialPosts: Post[] = [
        {
          id: 1,
          anonymousId: '익명1',
          content: '테스트 게시물 1',
          emotion: '행복',
          emotionIcon: '😊',
          image: '',
          likes: 5,
          comments: [],
          timestamp: '1시간 전'
        },
        {
          id: 2,
          anonymousId: '익명2',
          content: '테스트 게시물 2',
          emotion: '슬픔',
          emotionIcon: '😢',
          image: '',
          likes: 10,
          comments: [],
          timestamp: '2시간 전'
        }
      ];
      
      const setPosts = jest.fn();
      
      handleLikeAction(initialPosts, 1, setPosts);
      
      // posts 배열의 첫 번째 항목만 좋아요 수가 증가했는지 확인
      expect(setPosts).toHaveBeenCalledWith([
        {
          id: 1,
          anonymousId: '익명1',
          content: '테스트 게시물 1',
          emotion: '행복',
          emotionIcon: '😊',
          image: '',
          likes: 6, // 5에서 6으로 증가
          comments: [],
          timestamp: '1시간 전'
        },
        {
          id: 2,
          anonymousId: '익명2',
          content: '테스트 게시물 2',
          emotion: '슬픔',
          emotionIcon: '😢',
          image: '',
          likes: 10, // 변화 없음
          comments: [],
          timestamp: '2시간 전'
        }
      ]);
    });
  });
  
  // handleCommentAction 테스트
  describe('handleCommentAction', () => {
    it('adds a new comment to the specified post', () => {
      const initialPosts: Post[] = [
        {
          id: 1,
          anonymousId: '익명1',
          content: '테스트 게시물 1',
          emotion: '행복',
          emotionIcon: '😊',
          image: '',
          likes: 5,
          comments: [],
          timestamp: '1시간 전'
        }
      ];
      
      const setPosts = jest.fn();
      const commentContent = '테스트 댓글';
      
      // Date.now를 모킹하여 댓글 ID를 예측 가능하게 만듦
      const originalDateNow = Date.now;
      Date.now = jest.fn(() => 123456789);
      
      handleCommentAction(initialPosts, 1, commentContent, setPosts);
      
      // 모킹된 함수 복원
      Date.now = originalDateNow;
      
      // 댓글이 추가되었는지 확인
      const updatedPosts = setPosts.mock.calls[0][0];
      expect(updatedPosts[0].comments).toHaveLength(1);
      expect(updatedPosts[0].comments[0]).toEqual({
        id: 123456789,
        author: '익명',
        content: '테스트 댓글'
      });
    });
  });
});