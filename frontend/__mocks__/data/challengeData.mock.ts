// __tests__/mocks/data/challengeData.mock.ts
export const mockChallenges = [
    {
      challenge_id: 1,
      creator_id: 1,
      title: '일주일 동안 행복한 순간 기록하기',
      description: '매일 행복했던 순간을 하나씩 기록해보세요.',
      start_date: '2025-04-10',
      end_date: '2025-04-17',
      is_public: true,
      max_participants: 50,
      participant_count: 25,
      created_at: '2025-04-09T10:00:00Z'
    },
    {
      challenge_id: 2,
      creator_id: 2,
      title: '감사 일기 쓰기',
      description: '하루에 세 가지 감사한 일을 기록하는 챌린지',
      start_date: '2025-04-15',
      end_date: '2025-04-29',
      is_public: true,
      max_participants: 30,
      participant_count: 10,
      created_at: '2025-04-08T11:30:00Z'
    }
  ];
  
  export const mockChallengeEmotions = [
    {
      challenge_emotion_id: 1,
      challenge_id: 1,
      user_id: 1,
      emotion_id: 1,
      log_date: '2025-04-12',
      note: '친구와 맛있는 식사를 했다',
      created_at: '2025-04-12T20:10:00Z'
    },
    {
      challenge_emotion_id: 2,
      challenge_id: 1,
      user_id: 1,
      emotion_id: 2,
      log_date: '2025-04-11',
      note: '동료에게 도움을 받았다',
      created_at: '2025-04-11T21:00:00Z'
    }
  ];
  
  export const mockParticipants = [
    { user_id: 1, nickname: '사용자1', profile_image_url: 'https://example.com/profile1.jpg' },
    { user_id: 3, nickname: '사용자3', profile_image_url: 'https://example.com/profile3.jpg' },
    { user_id: 5, nickname: '사용자5', profile_image_url: 'https://example.com/profile5.jpg' }
  ];