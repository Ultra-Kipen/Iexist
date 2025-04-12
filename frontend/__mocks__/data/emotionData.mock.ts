// __tests__/mocks/data/emotionData.mock.ts
export const mockEmotions = [
    { emotion_id: 1, name: '행복', icon: 'emoticon-happy-outline', color: '#FFD700' },
    { emotion_id: 2, name: '감사', icon: 'hand-heart', color: '#FF69B4' },
    { emotion_id: 3, name: '위로', icon: 'hand-peace', color: '#87CEEB' },
    { emotion_id: 4, name: '감동', icon: 'heart-outline', color: '#FF6347' },
    { emotion_id: 5, name: '슬픔', icon: 'emoticon-sad-outline', color: '#4682B4' },
    { emotion_id: 6, name: '불안', icon: 'alert-outline', color: '#DDA0DD' },
    { emotion_id: 7, name: '화남', icon: 'emoticon-angry-outline', color: '#FF4500' },
    { emotion_id: 8, name: '지침', icon: 'emoticon-neutral-outline', color: '#A9A9A9' },
    { emotion_id: 9, name: '우울', icon: 'weather-cloudy', color: '#708090' }
  ];
  
  export const mockEmotionLogs = [
    { log_id: 1, user_id: 1, emotion_id: 1, note: '오늘은 즐거운 하루', log_date: '2025-04-12' },
    { log_id: 2, user_id: 1, emotion_id: 5, note: '힘든 하루였다', log_date: '2025-04-11' },
    { log_id: 3, user_id: 1, emotion_id: 2, note: '감사한 일이 있었다', log_date: '2025-04-10' },
    { log_id: 4, user_id: 1, emotion_id: 4, note: '감동적인 영화를 봤다', log_date: '2025-04-09' },
    { log_id: 5, user_id: 1, emotion_id: 1, note: '좋은 소식을 들었다', log_date: '2025-04-08' }
  ];
  
  export const mockEmotionStats = {
    weekly: {
      labels: ['월', '화', '수', '목', '금', '토', '일'],
      datasets: [
        {
          data: [1, 5, 2, 4, 1, 3, 6],
          colors: ['#FFD700', '#4682B4', '#FF69B4', '#FF6347', '#FFD700', '#87CEEB', '#DDA0DD']
        }
      ]
    },
    monthly: {
      labels: ['1주', '2주', '3주', '4주'],
      datasets: [
        {
          data: [1, 3, 2, 5],
          colors: ['#FFD700', '#87CEEB', '#FF69B4', '#4682B4']
        }
      ]
    }
  };