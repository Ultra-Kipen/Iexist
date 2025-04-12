// __tests__/mocks/contexts/EmotionContextMock.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { mockEmotions, mockEmotionLogs } from '../data/emotionData.mock';

interface EmotionContextType {
  emotions: any[];
  userEmotions: any[];
  todayEmotion: any | null;
  selectedEmotions: any[];
  isLoading: boolean;
  error: string | null;
  fetchEmotions: () => Promise<void>;
  fetchUserEmotions: () => Promise<void>;
  logEmotion: (emotionIds: number[], note?: string) => Promise<void>;
  setSelectedEmotions: (emotions: any[]) => void;
  clearSelectedEmotions: () => void;
}

const defaultContext: EmotionContextType = {
  emotions: [],
  userEmotions: [],
  todayEmotion: null,
  selectedEmotions: [],
  isLoading: false,
  error: null,
  fetchEmotions: async () => {},
  fetchUserEmotions: async () => {},
  logEmotion: async () => {},
  setSelectedEmotions: () => {},
  clearSelectedEmotions: () => {}
};

export const MockEmotionContext = createContext<EmotionContextType>(defaultContext);

export const useMockEmotionContext = () => useContext(MockEmotionContext);

export const MockEmotionProvider = ({ children, initialState }: { children: ReactNode, initialState?: Partial<EmotionContextType> }) => {
  const [emotions, setEmotions] = useState(initialState?.emotions || mockEmotions);
  const [userEmotions, setUserEmotions] = useState(initialState?.userEmotions || mockEmotionLogs);
  const [selectedEmotions, setSelectedEmotions] = useState<any[]>(initialState?.selectedEmotions || []);
  const [isLoading, setIsLoading] = useState(initialState?.isLoading || false);
  const [error, setError] = useState<string | null>(initialState?.error || null);

  // 오늘 감정 찾기
  const today = new Date().toISOString().split('T')[0];
  const todayEmotion = userEmotions.find(e => e.log_date === today) || null;

  const fetchEmotions = async () => {
    setIsLoading(true);
    try {
      // 실제 API 호출 대신 목업 데이터 사용
      setEmotions(mockEmotions);
      setError(null);
    } catch (err) {
      setError('감정 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserEmotions = async () => {
    setIsLoading(true);
    try {
      // 실제 API 호출 대신 목업 데이터 사용
      setUserEmotions(mockEmotionLogs);
      setError(null);
    } catch (err) {
      setError('사용자 감정 기록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const logEmotion = async (emotionIds: number[], note?: string) => {
    setIsLoading(true);
    try {
      // 목업 데이터에 새 감정 추가
      const newEmotionLog = {
        log_id: Math.floor(Math.random() * 1000) + 100,
        user_id: 1, // 테스트용 사용자 ID
        emotion_id: emotionIds[0], // 첫 번째 감정만 사용
        note: note || '',
        log_date: today,
        created_at: new Date().toISOString()
      };

      setUserEmotions([newEmotionLog, ...userEmotions]);
      setError(null);
    } catch (err) {
      setError('감정 기록에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearSelectedEmotions = () => {
    setSelectedEmotions([]);
  };

  return (
    <MockEmotionContext.Provider
      value={{
        emotions,
        userEmotions,
        todayEmotion,
        selectedEmotions,
        isLoading,
        error,
        fetchEmotions,
        fetchUserEmotions,
        logEmotion,
        setSelectedEmotions,
        clearSelectedEmotions
      }}
    >
      {children}
    </MockEmotionContext.Provider>
  );
};