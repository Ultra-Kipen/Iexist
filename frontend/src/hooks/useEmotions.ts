import { useState, useEffect, useCallback } from 'react';
import { useStore } from '../store';
import { actions } from '../store/actions';

interface Emotion {
  id: number;
  name: string;
  icon: string;
  color: string;
}

interface UseEmotionsReturn {
  emotions: Emotion[];
  selectedEmotions: number[];
  loading: boolean;
  error: string | null;
  toggleEmotion: (emotionId: number) => void;
  selectEmotion: (emotionId: number) => void;
  deselectEmotion: (emotionId: number) => void;
  clearEmotions: () => void;
  fetchEmotions: () => Promise<void>;
}

export const useEmotions = (): UseEmotionsReturn => {
  const { state, dispatch } = useStore();
  const [emotions, setEmotions] = useState<Emotion[]>([]);
  const [selectedEmotions, setSelectedEmotions] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEmotions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // API 호출 코드 (실제 구현 필요)
      const response = await fetch('/api/emotions');
      const data = await response.json();
      
      setEmotions(data);
    } catch (error: any) {
      setError(error.message || '감정 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmotions();
  }, [fetchEmotions]);

  const toggleEmotion = useCallback((emotionId: number) => {
    setSelectedEmotions(prev => {
      const exists = prev.includes(emotionId);
      if (exists) {
        return prev.filter(id => id !== emotionId);
      } else {
        return [...prev, emotionId];
      }
    });
  }, []);

  const selectEmotion = useCallback((emotionId: number) => {
    setSelectedEmotions(prev => {
      if (!prev.includes(emotionId)) {
        return [...prev, emotionId];
      }
      return prev;
    });
  }, []);

  const deselectEmotion = useCallback((emotionId: number) => {
    setSelectedEmotions(prev => prev.filter(id => id !== emotionId));
  }, []);

  const clearEmotions = useCallback(() => {
    setSelectedEmotions([]);
  }, []);

  return {
    emotions,
    selectedEmotions,
    loading,
    error,
    toggleEmotion,
    selectEmotion,
    deselectEmotion,
    clearEmotions,
    fetchEmotions
  };
};