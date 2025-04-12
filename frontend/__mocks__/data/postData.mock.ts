// __tests__/mocks/data/postData.mock.ts
export const mockMyDayPosts = [
    {
      post_id: 1,
      user_id: 1,
      content: '오늘은 정말 행복한 하루였어요!',
      emotion_summary: '행복',
      image_url: 'https://example.com/image1.jpg',
      is_anonymous: false,
      character_count: 50,
      like_count: 5,
      comment_count: 2,
      created_at: '2025-04-12T14:22:30Z',
      emotions: [{ emotion_id: 1, name: '행복', icon: 'emoticon-happy-outline', color: '#FFD700' }]
    },
    {
      post_id: 2,
      user_id: 1,
      content: '힘든 일이 있었지만 잘 극복했습니다.',
      emotion_summary: '위로',
      image_url: null,
      is_anonymous: false,
      character_count: 60,
      like_count: 3,
      comment_count: 1,
      created_at: '2025-04-11T19:15:10Z',
      emotions: [{ emotion_id: 3, name: '위로', icon: 'hand-peace', color: '#87CEEB' }]
    }
  ];
  
  export const mockSomeoneDayPosts = [
    {
      post_id: 3,
      user_id: 2,
      title: '오늘의 기록',
      content: '길을 걷다가 아름다운 꽃을 발견했어요. 사진 찍어서 공유합니다.',
      summary: '꽃 구경',
      image_url: 'https://example.com/image2.jpg',
      is_anonymous: false,
      character_count: 100,
      like_count: 10,
      comment_count: 3,
      created_at: '2025-04-12T12:10:05Z',
      tags: ['꽃', '산책', '행복']
    },
    {
      post_id: 4,
      user_id: 3,
      title: '위로가 필요한 날',
      content: '요즘 힘든 일이 많아서 위로가 필요해요.',
      summary: '힘든 시간',
      image_url: null,
      is_anonymous: true,
      character_count: 80,
      like_count: 15,
      comment_count: 7,
      created_at: '2025-04-11T22:30:45Z',
      tags: ['위로', '공감', '힘내자']
    }
  ];
  
  export const mockComments = [
    {
      comment_id: 1,
      post_id: 1,
      user_id: 2,
      content: '정말 좋은 하루였네요! 축하해요!',
      is_anonymous: false,
      created_at: '2025-04-12T15:10:22Z'
    },
    {
      comment_id: 2,
      post_id: 1,
      user_id: 3,
      content: '행복한 모습이 보기 좋네요.',
      is_anonymous: true,
      created_at: '2025-04-12T15:30:15Z'
    }
  ];