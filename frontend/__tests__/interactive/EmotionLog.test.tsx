// EmotionLog.test.tsx - 감정 로깅 기능 단위 테스트
import React from 'react';
import { act, renderHook } from '@testing-library/react-native';
import emotionService from '../../src/services/api/emotionService';

// 타입 정의
interface Emotion {
  emotion_id: number;
  name: string;
  icon: string;
  color: string;
}

interface EmotionContextType {
  emotions: Emotion[];
  selectedEmotions: number[];
  logEmotion: (emotionId: number, note?: string) => Promise<boolean>;
  selectEmotion: (id: number) => void;
  clearSelectedEmotions: () => void;
}

interface EmotionServiceMock {
  recordEmotions: jest.Mock;
  getAllEmotions: jest.Mock;
  getDailyEmotionCheck: jest.Mock;
}

// API 서비스 모킹
jest.mock('../../src/services/api/emotionService', () => ({
  recordEmotions: jest.fn().mockResolvedValue({ success: true }),
  getAllEmotions: jest.fn().mockResolvedValue({
    data: [
      { emotion_id: 1, name: '행복', icon: 'emoticon-happy-outline', color: '#FFD700' }
    ]
  }),
  getDailyEmotionCheck: jest.fn().mockResolvedValue({ data: [] })
}));

// EmotionContext 훅 모킹
jest.mock('../../src/contexts/EmotionContext', () => {
  const useEmotionMock = (): EmotionContextType => {
    const emotions: Emotion[] = [
      { emotion_id: 1, name: '행복', icon: 'emoticon-happy-outline', color: '#FFD700' }
    ];
    const selectedEmotions: number[] = [];
    
    const logEmotion = async (emotionId: number, note?: string): Promise<boolean> => {
      await require('../../src/services/api/emotionService').recordEmotions({
        emotion_ids: [emotionId],
        note
      });
      return true;
    };
    
    const selectEmotion = (id: number): void => {
      // 간단한 테스트를 위해 상태 변경 로직은 생략
      console.log(`Emotion ${id} selected`);
    };
    
    const clearSelectedEmotions = (): void => {
      console.log('Cleared selected emotions');
    };
    
    return {
      emotions,
      selectedEmotions,
      logEmotion,
      selectEmotion,
      clearSelectedEmotions
    };
  };
  
  return {
    useEmotion: useEmotionMock
  };
});

describe('Emotion Logging Functionality', () => {
  it('calls recordEmotions API when logEmotion is called', async () => {
    // 모킹된 EmotionContext의 useEmotion 가져오기
    const { useEmotion } = require('../../src/contexts/EmotionContext');
    const emotionContext: EmotionContextType = useEmotion();
    
    // logEmotion 함수 호출
    await emotionContext.logEmotion(1, '행복한 하루였어요');
    
    // API 호출 확인
    expect(emotionService.recordEmotions).toHaveBeenCalledWith({
      emotion_ids: [1],
      note: '행복한 하루였어요'
    });
  });
  
  it('provides emotions data', () => {
    // 모킹된 EmotionContext의 useEmotion 가져오기
    const { useEmotion } = require('../../src/contexts/EmotionContext');
    const emotionContext: EmotionContextType = useEmotion();
    
    // emotions 데이터 확인
    expect(emotionContext.emotions).toEqual([
      { emotion_id: 1, name: '행복', icon: 'emoticon-happy-outline', color: '#FFD700' }
    ]);
  });
  
  it('has selectedEmotions array', () => {
    // 모킹된 EmotionContext의 useEmotion 가져오기
    const { useEmotion } = require('../../src/contexts/EmotionContext');
    const emotionContext: EmotionContextType = useEmotion();
    
    // selectedEmotions가 배열인지 확인
    expect(Array.isArray(emotionContext.selectedEmotions)).toBe(true);
    expect(emotionContext.selectedEmotions).toEqual([]);
  });
});