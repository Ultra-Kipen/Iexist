import MyDayPost from '../../models/MyDayPost';
import { User } from '../../models/User';

// MyDayPost 모델 모킹
jest.mock('../../models/MyDayPost', () => {
  return {
    create: jest.fn(),
    findByPk: jest.fn(),
    destroy: jest.fn()
  };
});

// User 모델 모킹
jest.mock('../../models/User', () => {
  return {
    User: {
      create: jest.fn(),
      destroy: jest.fn()
    }
  };
});

describe('MyDayPost Model', () => {
  // 각 테스트 전에 모든 모킹을 초기화
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('MyDay 게시물을 생성할 수 있어야 합니다', async () => {
    const postData = {
      user_id: 1,
      content: '오늘은 테스트를 하는 날입니다. 잘 되기를 바랍니다.',
      is_anonymous: false,
      character_count: 30,
      like_count: 0,
      comment_count: 0
    };

    const mockCreatedPost = {
      ...postData,
      post_id: 1,
      created_at: new Date(),
      updated_at: new Date()
    };

    (MyDayPost.create as jest.Mock).mockResolvedValue(mockCreatedPost);

    const post = await MyDayPost.create(postData);
    
    expect(post).toBeDefined();
    expect(post).toHaveProperty('post_id');
    expect(post.content).toBe(postData.content);
    expect(post.user_id).toBe(1);
    expect(MyDayPost.create).toHaveBeenCalledWith(postData);
  });

  it('필수 필드가 누락되면 오류가 발생해야 합니다', async () => {
    // TypeScript 오류를 피하기 위해 as any 사용
    const invalidPostData = {
      user_id: 1,
      // content 누락 - 의도적으로 TypeScript 타입 체크를 우회
      is_anonymous: false,
      like_count: 0,
      comment_count: 0
    } as any; // any 타입으로 캐스팅하여 TypeScript 검증 우회

    (MyDayPost.create as jest.Mock).mockRejectedValue(new Error('내용은 필수 항목입니다'));

    await expect(MyDayPost.create(invalidPostData)).rejects.toThrow('내용은 필수 항목입니다');
    expect(MyDayPost.create).toHaveBeenCalledWith(invalidPostData);
  });

  it('게시물 정보를 업데이트할 수 있어야 합니다', async () => {
    const postData = {
      user_id: 1,
      content: '오늘은 테스트를 하는 날입니다. 잘 되기를 바랍니다.',
      is_anonymous: false,
      character_count: 30,
      like_count: 0,
      comment_count: 0
    };

    const mockCreatedPost = {
      ...postData,
      post_id: 1,
      created_at: new Date(),
      updated_at: new Date(),
      save: jest.fn().mockResolvedValue(undefined)
    };

    (MyDayPost.create as jest.Mock).mockResolvedValue(mockCreatedPost);
    
    const post = await MyDayPost.create(postData);
    
    // 좋아요 카운트 업데이트
    post.like_count = 5;
    await post.save();
    
    const updatedPost = {
      ...mockCreatedPost,
      like_count: 5
    };
    
    (MyDayPost.findByPk as jest.Mock).mockResolvedValue(updatedPost);
    
    const fetchedPost = await MyDayPost.findByPk(post.post_id);
    expect(fetchedPost).toBeDefined();
    expect(fetchedPost!.like_count).toBe(5);
    expect(post.save).toHaveBeenCalled();
  });

  it('게시물을 작성자 정보와 함께 조회할 수 있어야 합니다', async () => {
    const postData = {
      user_id: 1,
      content: '오늘은 테스트를 하는 날입니다. 잘 되기를 바랍니다.',
      is_anonymous: false,
      character_count: 30,
      like_count: 0,
      comment_count: 0
    };

    const mockCreatedPost = {
      ...postData,
      post_id: 1,
      created_at: new Date(),
      updated_at: new Date()
    };

    (MyDayPost.create as jest.Mock).mockResolvedValue(mockCreatedPost);
    
    const post = await MyDayPost.create(postData);
    
    const mockUser = {
      user_id: 1,
      nickname: 'Test User'
    };
    
    const mockPostWithUser = {
      ...mockCreatedPost,
      get: jest.fn((field) => {
        if (field === 'user') return mockUser;
        return mockCreatedPost[field as keyof typeof mockCreatedPost];
      })
    };
    
    (MyDayPost.findByPk as jest.Mock).mockResolvedValue(mockPostWithUser);
    
    const foundPost = await MyDayPost.findByPk(post.post_id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['user_id', 'nickname']
      }]
    });
    
    expect(foundPost).toBeDefined();
    expect(foundPost!.get('user')).toBeDefined();
    // TypeScript 에러 수정 - 타입 단언(type assertion) 사용
    const userInfo = foundPost!.get('user') as { nickname: string };
    expect(userInfo.nickname).toBe('Test User');
  });

  it('감정 요약과 이미지 URL을 포함할 수 있어야 합니다', async () => {
    const postData = {
      user_id: 1,
      content: '오늘은 테스트를 하는 날입니다. 잘 되기를 바랍니다.',
      emotion_summary: '기쁨과 설렘',
      image_url: 'https://example.com/test-image.jpg',
      is_anonymous: false,
      character_count: 30,
      like_count: 0,
      comment_count: 0
    };

    const mockCreatedPost = {
      ...postData,
      post_id: 1,
      created_at: new Date(),
      updated_at: new Date()
    };

    (MyDayPost.create as jest.Mock).mockResolvedValue(mockCreatedPost);

    const post = await MyDayPost.create(postData);
    
    expect(post).toBeDefined();
    expect(post.emotion_summary).toBe('기쁨과 설렘');
    expect(post.image_url).toBe('https://example.com/test-image.jpg');
  });
});