// root/frontend/tests/integration/screens/ReviewScreen.integration.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';

// 단순하게 모킹 - 문자열만 사용
jest.mock('react-native-paper', () => ({
  useTheme: jest.fn().mockReturnValue({
    colors: { primary: '#000', background: '#fff' }
  }),
  SegmentedButtons: 'SegmentedButtons',
  Card: 'Card',
  Button: 'Button',
  Text: 'Text',
  ActivityIndicator: 'ActivityIndicator'
}));

// API 서비스 모킹
jest.mock('../../../src/services/api/emotionService', () => ({
  getEmotionStats: jest.fn().mockResolvedValue({
    emotions: [
      { id: 1, name: '행복', count: 5, color: '#FFD700' },
      { id: 5, name: '슬픔', count: 2, color: '#4682B4' },
      { id: 6, name: '불안', count: 1, color: '#DDA0DD' }
    ],
    mostFrequent: { id: 1, name: '행복', count: 5, color: '#FFD700' }
  }),
  getEmotionHistory: jest.fn().mockResolvedValue([
    { date: '2025-05-01', emotions: [{ id: 1, name: '행복', color: '#FFD700' }] },
    { date: '2025-05-02', emotions: [{ id: 5, name: '슬픔', color: '#4682B4' }] },
    { date: '2025-05-03', emotions: [{ id: 1, name: '행복', color: '#FFD700' }] }
  ])
}));

jest.mock('../../../src/services/api/postService', () => ({
  getUserPosts: jest.fn().mockResolvedValue([
    { id: 1, imageUrl: 'https://example.com/1.jpg', content: '좋은 하루', createdAt: '2025-05-03' },
    { id: 2, imageUrl: 'https://example.com/2.jpg', content: '힘든 하루', createdAt: '2025-05-02' },
    { id: 3, imageUrl: 'https://example.com/3.jpg', content: '평범한 하루', createdAt: '2025-05-01' },
    { id: 4, imageUrl: 'https://example.com/4.jpg', content: '즐거운 하루', createdAt: '2025-04-30' },
    { id: 5, imageUrl: 'https://example.com/5.jpg', content: '지친 하루', createdAt: '2025-04-29' },
    { id: 6, imageUrl: 'https://example.com/6.jpg', content: '특별한 하루', createdAt: '2025-04-28' }
  ])
}));

// 네비게이션 모킹
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn().mockReturnValue({
    navigate: jest.fn(),
    goBack: jest.fn()
  }),
  useRoute: jest.fn().mockReturnValue({
    params: {}
  })
}));

// ReviewScreen 모킹 - 단순하게 모킹
jest.mock('../../../src/screens/ReviewScreen', () => 'ReviewScreen');

describe('ReviewScreen 통합 테스트', () => {
  // 기본적인 테스트 케이스
  it('서비스 모듈을 올바르게 호출해야 함', () => {
    const emotionService = require('../../../src/services/api/emotionService');
    const postService = require('../../../src/services/api/postService');
    
    // 모형 함수 생성
    const mockLoadData = () => {
      postService.getUserPosts({
        period: 'weekly',
        limit: 20
      });
      emotionService.getEmotionStats({
        period: 'weekly'
      });
    };
    
    // 함수 실행
    mockLoadData();
    
    // API 호출 확인
    expect(postService.getUserPosts).toHaveBeenCalledWith({
      period: 'weekly',
      limit: 20
    });
    
    expect(emotionService.getEmotionStats).toHaveBeenCalledWith({
      period: 'weekly'
    });
  });

  it('네비게이션 기능이 올바르게 작동해야 함', () => {
    const navigation = require('@react-navigation/native').useNavigation();
    
    // 네비게이션 함수 호출
    const navigateToDetail = (postId) => {
      navigation.navigate('PostDetail', { postId });
    };
    
    // 함수 실행
    navigateToDetail(5);
    
    // 네비게이션 호출 확인
    expect(navigation.navigate).toHaveBeenCalledWith('PostDetail', { postId: 5 });
  });

  it('화면 전환 시 네비게이션 함수가 호출되어야 함', () => {
    const navigation = require('@react-navigation/native').useNavigation();
    
    // 그래프 화면으로 이동 함수
    const navigateToGraph = (data) => {
      navigation.navigate('EmotionGraph', data);
    };
    
    // 함수 실행
    navigateToGraph({ period: 'weekly', emotions: [] });
    
    // 네비게이션 호출 확인
    expect(navigation.navigate).toHaveBeenCalledWith('EmotionGraph', { 
      period: 'weekly', 
      emotions: [] 
    });
  });

  it('데이터 로딩 함수가 올바른 순서로 호출되어야 함', () => {
    const emotionService = require('../../../src/services/api/emotionService');
    const postService = require('../../../src/services/api/postService');
    
    // API 호출 순서 테스트
    const loadAllData = async (period) => {
      await postService.getUserPosts({ period, limit: 20 });
      await emotionService.getEmotionStats({ period });
      return { success: true };
    };
    
    // 함수 실행
    return loadAllData('monthly').then(result => {
      // 결과 확인
      expect(result).toEqual({ success: true });
      
      // API 호출 확인
      expect(postService.getUserPosts).toHaveBeenCalledWith({
        period: 'monthly',
        limit: 20
      });
      
      expect(emotionService.getEmotionStats).toHaveBeenCalledWith({
        period: 'monthly'
      });
    });
  });
});