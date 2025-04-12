import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import emotionService, { Emotion } from '../services/api/emotionService';

// EmotionLog 타입 정의
interface EmotionLog {
  log_id: number;
  user_id: number;
  emotion_id: number;
  note?: string;
  log_date: string;
  created_at: string;
  updated_at: string;
  emotion?: Emotion;
}

interface EmotionContextType {
  emotions: Emotion[];
  userEmotions: EmotionLog[];
  selectedEmotions: number[];
  isLoading: boolean;
  error: string | null;
  fetchEmotions: () => Promise<void>;
  fetchUserEmotions: () => Promise<void>;
  logEmotion: (emotionId: number, note?: string) => Promise<void>;
  selectEmotion: (emotionId: number) => void;
  unselectEmotion: (emotionId: number) => void;
  clearSelectedEmotions: () => void;
}

const EmotionContext = createContext<EmotionContextType | undefined>(undefined);

export const useEmotion = () => {
  const context = useContext(EmotionContext);
  if (context === undefined) {
    throw new Error('useEmotion must be used within an EmotionProvider');
  }
  return context;
};

interface EmotionProviderProps {
  children: ReactNode;
}

export const EmotionProvider: React.FC<EmotionProviderProps> = ({ children }) => {
  const [emotions, setEmotions] = useState<Emotion[]>([]);
  const [userEmotions, setUserEmotions] = useState<EmotionLog[]>([]);
  const [selectedEmotions, setSelectedEmotions] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEmotions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await emotionService.getAllEmotions();
      // API 응답에서 데이터 직접 추출
      const apiResponse = response as unknown as { data: Emotion[] };
      if (apiResponse && apiResponse.data) {
        setEmotions(apiResponse.data);
      }
    } catch (err) {
      setError('감정 목록을 불러오는데 실패했습니다.');
      console.error('감정 목록 불러오기 오류:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserEmotions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await emotionService.getDailyEmotionCheck();
      if (response && response.data) {
        setUserEmotions(response.data);
      }
    } catch (err) {
      setError('사용자 감정 기록을 불러오는데 실패했습니다.');
      console.error('사용자 감정 기록 불러오기 오류:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const logEmotion = async (emotionId: number, note?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await emotionService.recordEmotions({ emotion_ids: [emotionId], note });
      await fetchUserEmotions();
    } catch (err) {
      setError('감정 기록에 실패했습니다.');
      console.error('감정 기록 오류:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const selectEmotion = (emotionId: number) => {
    if (!selectedEmotions.includes(emotionId)) {
      setSelectedEmotions([...selectedEmotions, emotionId]);
    }
  };

  const unselectEmotion = (emotionId: number) => {
    setSelectedEmotions(selectedEmotions.filter(id => id !== emotionId));
  };

  const clearSelectedEmotions = () => {
    setSelectedEmotions([]);
  };

  useEffect(() => {
    fetchEmotions();
  }, []);

  return (
    <EmotionContext.Provider
      value={{
        emotions,
        userEmotions,
        selectedEmotions,
        isLoading,
        error,
        fetchEmotions,
        fetchUserEmotions,
        logEmotion,
        selectEmotion,
        unselectEmotion,
        clearSelectedEmotions,
      }}
    >
      {children}
    </EmotionContext.Provider>
  );
};