export const mockChallengeData = {
    title: '30일 감정 기록 챌린지',
    description: '매일 감정을 기록하고 공유하는 30일 챌린지입니다.',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    is_public: true,
    max_participants: 100
  };
  
  export const mockChallengeEmotionData = {
    emotion_id: 1,
    progress_note: '오늘은 행복한 하루였습니다.'
  };
  
  export const mockChallengeUpdateData = {
    title: '수정된 챌린지 제목',
    description: '수정된 챌린지 설명',
    is_public: false,
    max_participants: 50
  };
  
  export const mockChallengeFilters = {
    status: 'active',
    sort_by: 'participant_count',
    order: 'desc',
    page: '1',
    limit: '10'
  };
  
  export const mockChallengeParticipant = {
    user_id: 1,
    challenge_id: 1,
    created_at: new Date()
  };
  
  export const mockChallengeResponse = {
    status: 'success',
    data: {
      challenge_id: 1,
      title: '30일 감정 기록 챌린지',
      description: '매일 감정을 기록하고 공유하는 30일 챌린지입니다.',
      creator_id: 1,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      is_public: true,
      max_participants: 100,
      participant_count: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  };