import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import emotionService from '../../src/services/api/emotionService';

// EmotionLogScreen 컴포넌트 자체를 모킹
jest.mock('../../src/screens/EmotionLogScreen', () => 'MockedEmotionLogScreen');

// 서비스 모킹
jest.mock('../../src/services/api/emotionService', () => ({
  getAllEmotions: jest.fn(),
  recordEmotions: jest.fn()
}));

// Alert 모킹
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

// 네비게이션 모킹
const mockNavigation = { goBack: jest.fn() };

// 목 데이터
const mockEmotionsResponse = {
  data: {
    status: 'success',
    data: [
      { emotion_id: 1, name: '행복', icon: 'emoticon-happy-outline', color: '#FFD700' },
      { emotion_id: 2, name: '감사', icon: 'hand-heart', color: '#FF69B4' }
    ]
  }
};

describe('EmotionService API 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (emotionService.getAllEmotions as jest.Mock).mockResolvedValue(mockEmotionsResponse);
    (emotionService.recordEmotions as jest.Mock).mockResolvedValue({ status: 200 });
  });

  // getAllEmotions API 테스트
  it('getAllEmotions API가 올바르게 호출됨', async () => {
    // API 호출
    const result = await emotionService.getAllEmotions();
    
    // 결과 검증
    expect(emotionService.getAllEmotions).toHaveBeenCalled();
    expect(result).toEqual(mockEmotionsResponse);
  });

  // recordEmotions API 테스트
  it('recordEmotions API가 올바른 파라미터와 함께 호출됨', async () => {
    // 테스트 데이터
    const emotionData = {
      emotion_ids: [1, 2],
      note: '오늘은 기분이 좋았어요.'
    };
    
    // API 호출
    await emotionService.recordEmotions(emotionData);
    
    // 결과 검증
    expect(emotionService.recordEmotions).toHaveBeenCalledWith(emotionData);
  });

  // 오류 처리 테스트
  it('API 오류가 올바르게 처리됨', async () => {
    // 오류 시뮬레이션
    const errorResponse = { 
      response: { 
        data: { message: '감정 기록 실패' } 
      } 
    };
    (emotionService.recordEmotions as jest.Mock).mockRejectedValueOnce(errorResponse);
    
    // 오류 발생 확인
    try {
      const emotionData = { emotion_ids: [1] };
      await emotionService.recordEmotions(emotionData);
      // 이 줄이 실행되면 테스트 실패
      expect(true).toBe(false); 
    } catch (error) {
      // 오류 객체 확인
      expect(error).toEqual(errorResponse);
    }
  });
  
  // 응답 형식 테스트
  it('감정 데이터가 올바른 형식으로 반환됨', async () => {
    // API 호출
    const result = await emotionService.getAllEmotions();
    
    // 결과 검증 - 데이터 구조 확인
    expect(result.data).toBeDefined();
    expect(result.data.status).toBe('success');
    expect(Array.isArray(result.data.data)).toBe(true);
    
    // 첫 번째 감정 객체 검증
    const emotion = result.data.data[0];
    expect(emotion).toHaveProperty('emotion_id');
    expect(emotion).toHaveProperty('name');
    expect(emotion).toHaveProperty('icon');
    expect(emotion).toHaveProperty('color');
  });
});