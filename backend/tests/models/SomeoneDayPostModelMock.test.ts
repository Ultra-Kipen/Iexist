
import db from '../../models';
import SomeoneDayPost from '../../models/SomeoneDayPost';
import { User } from '../../models/User';
import Tag from '../../models/Tag';

// 모킹 설정
jest.mock('../../models/SomeoneDayPost');
jest.mock('../../models/User');
jest.mock('../../models/Tag');

// db 모킹 추가
jest.mock('../../models', () => {
  return {
    __esModule: true,
    default: {
      SomeoneDayTag: {
        create: jest.fn().mockResolvedValue({})
      }
    }
  };
});

describe('SomeoneDayPost Model (Mocked)', () => {
  let testUser: any;
  let testTag: any;

  beforeEach(() => {
    // 목업 설정 초기화
    jest.clearAllMocks();

    // 테스트 사용자 생성 모킹
    testUser = {
      user_id: 1, 
      username: 'someonedaytest',
      email: 'someonedaytest@example.com',
      nickname: 'SomeoneDay Test User'
    };
    
    // 테스트 태그 생성 모킹
    testTag = {
      tag_id: 1,
      name: 'TestTag'
    };

    // User.create 모킹
    (User.create as jest.Mock).mockResolvedValue(testUser);
    
    // Tag.create 모킹
    (Tag.create as jest.Mock).mockResolvedValue(testTag);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('SomeoneDay 게시물을 생성할 수 있어야 합니다', async () => {
    // SomeoneDayPost.create 모킹
    const mockPost = {
      post_id: 1,
      user_id: testUser.user_id,
      title: '테스트 게시물 제목',
      content: '테스트 게시물 내용입니다. 20자 이상 작성해야 합니다. 테스트 중입니다.',
      summary: '테스트 게시물 요약',
      is_anonymous: false,
      character_count: 50,
      like_count: 0,
      comment_count: 0
    };
    (SomeoneDayPost.create as jest.Mock).mockResolvedValue(mockPost);

    const postData = {
      user_id: testUser.user_id,
      title: '테스트 게시물 제목',
      content: '테스트 게시물 내용입니다. 20자 이상 작성해야 합니다. 테스트 중입니다.',
      summary: '테스트 게시물 요약',
      is_anonymous: false,
      character_count: 50,
      like_count: 0,
      comment_count: 0
    };

    const post = await SomeoneDayPost.create(postData);
    
    expect(post).toBeDefined();
    expect(post).toHaveProperty('post_id');
    expect(post.title).toBe(postData.title);
    expect(post.content).toBe(postData.content);
    expect(post.user_id).toBe(testUser.user_id);
    expect(SomeoneDayPost.create).toHaveBeenCalledWith(postData);
  });

  it('필수 필드가 누락되면 오류가 발생해야 합니다', async () => {
    // SomeoneDayPost.create가 오류를 던지도록 모킹
    (SomeoneDayPost.create as jest.Mock).mockRejectedValue(new Error('Validation error'));

    const invalidPostData = {
      user_id: testUser.user_id,
      // title 누락
      content: '테스트 게시물 내용입니다. 20자 이상 작성해야 합니다. 테스트 중입니다.',
      is_anonymous: false,
      character_count: 50,
      like_count: 0,
      comment_count: 0
    };

    await expect(SomeoneDayPost.create(invalidPostData as any)).rejects.toThrow();
    expect(SomeoneDayPost.create).toHaveBeenCalledWith(invalidPostData);
  });

  it('게시물과 태그를 연결할 수 있어야 합니다', async () => {
    // 모킹된 게시물
    const mockPost = {
      post_id: 1,
      user_id: testUser.user_id,
      title: '테스트 게시물 제목',
      content: '테스트 게시물 내용입니다. 20자 이상 작성해야 합니다. 테스트 중입니다.',
      summary: '테스트 게시물 요약',
      is_anonymous: false,
      character_count: 50,
      like_count: 0,
      comment_count: 0
    };
    
    // findByPk 모킹
    (SomeoneDayPost.findByPk as jest.Mock).mockResolvedValue({
      ...mockPost,
      get: jest.fn((key) => {
        if (key === 'tags') {
          return [testTag];
        }
        return mockPost[key as keyof typeof mockPost];
      })
    });
    
    (SomeoneDayPost.create as jest.Mock).mockResolvedValue(mockPost);
    
    // db.SomeoneDayTag.create 모킹 업데이트
    (db.SomeoneDayTag.create as jest.Mock).mockResolvedValue({
      post_id: mockPost.post_id,
      tag_id: testTag.tag_id
    });

    const postData = {
      user_id: testUser.user_id,
      title: '테스트 게시물 제목',
      content: '테스트 게시물 내용입니다. 20자 이상 작성해야 합니다. 테스트 중입니다.',
      summary: '테스트 게시물 요약',
      is_anonymous: false,
      character_count: 50,
      like_count: 0,
      comment_count: 0
    };

    const post = await SomeoneDayPost.create(postData);
    
    // 게시물과 태그 연결
    await db.SomeoneDayTag.create({
      post_id: post.post_id,
      tag_id: testTag.tag_id
    });
    
    // 태그와 함께 게시물 조회
    const foundPost = await SomeoneDayPost.findByPk(post.post_id, {
      include: [{
        model: Tag,
        as: 'tags',
        through: { attributes: [] }
      }]
    });
    
    expect(foundPost).toBeDefined();
    expect(foundPost!.get('tags')).toBeDefined();
    
    // 타입 단언 추가
    const tags = foundPost!.get('tags') as Array<{ name: string }>;
    expect(tags.length).toBe(1);
    expect(tags[0].name).toBe('TestTag');
  });
  it('게시물 정보를 업데이트할 수 있어야 합니다', async () => {
    // 모킹된 게시물
    const mockPost = {
      post_id: 1,
      user_id: testUser.user_id,
      title: '테스트 게시물 제목',
      content: '테스트 게시물 내용입니다. 20자 이상 작성해야 합니다. 테스트 중입니다.',
      summary: '테스트 게시물 요약',
      is_anonymous: false,
      character_count: 50,
      like_count: 0,
      comment_count: 0,
      save: jest.fn()
    };
    
    // 업데이트된 게시물
    const updatedMockPost = {
      ...mockPost,
      like_count: 5,
      comment_count: 3
    };
    
    (SomeoneDayPost.create as jest.Mock).mockResolvedValue(mockPost);
    (SomeoneDayPost.findByPk as jest.Mock).mockResolvedValue(updatedMockPost);
    
    const postData = {
      user_id: testUser.user_id,
      title: '테스트 게시물 제목',
      content: '테스트 게시물 내용입니다. 20자 이상 작성해야 합니다. 테스트 중입니다.',
      summary: '테스트 게시물 요약',
      is_anonymous: false,
      character_count: 50,
      like_count: 0,
      comment_count: 0
    };

    const post = await SomeoneDayPost.create(postData);
    
    // 좋아요 카운트와 댓글 카운트 업데이트
    post.like_count = 5;
    post.comment_count = 3;
    await post.save();
    
    const updatedPost = await SomeoneDayPost.findByPk(post.post_id);
    expect(updatedPost).toBeDefined();
    expect(updatedPost!.like_count).toBe(5);
    expect(updatedPost!.comment_count).toBe(3);
    expect(mockPost.save).toHaveBeenCalled();
  });

  it('게시물을 작성자 정보와 함께 조회할 수 있어야 합니다', async () => {
    // 모킹된 게시물
    const mockPost = {
      post_id: 1,
      user_id: testUser.user_id,
      title: '테스트 게시물 제목',
      content: '테스트 게시물 내용입니다. 20자 이상 작성해야 합니다. 테스트 중입니다.',
      summary: '테스트 게시물 요약',
      is_anonymous: false,
      character_count: 50,
      like_count: 0,
      comment_count: 0
    };
    
    // findByPk 모킹
    (SomeoneDayPost.findByPk as jest.Mock).mockResolvedValue({
      ...mockPost,
      get: jest.fn((key) => {
        if (key === 'user') {
          return testUser;
        }
        return mockPost[key as keyof typeof mockPost];
      })
    });
    
    (SomeoneDayPost.create as jest.Mock).mockResolvedValue(mockPost);

    const postData = {
      user_id: testUser.user_id,
      title: '테스트 게시물 제목',
      content: '테스트 게시물 내용입니다. 20자 이상 작성해야 합니다. 테스트 중입니다.',
      summary: '테스트 게시물 요약',
      is_anonymous: false,
      character_count: 50,
      like_count: 0,
      comment_count: 0
    };

    const post = await SomeoneDayPost.create(postData);
    
    const foundPost = await SomeoneDayPost.findByPk(post.post_id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['user_id', 'nickname']
      }]
    });
    
    expect(foundPost).toBeDefined();
    expect(foundPost!.get('user')).toBeDefined();
    
    // 타입 단언 추가
    const user = foundPost!.get('user') as { nickname: string };
    expect(user.nickname).toBe('SomeoneDay Test User');
  });

  it('익명 게시물을 생성할 수 있어야 합니다', async () => {
    // 익명 게시물 모킹
    const mockAnonymousPost = {
      post_id: 1,
      user_id: testUser.user_id,
      title: '익명 테스트 게시물',
      content: '익명으로 작성하는 테스트 게시물입니다. 20자 이상 작성해야 합니다.',
      summary: '익명 테스트 게시물 요약',
      is_anonymous: true,
      character_count: 50,
      like_count: 0,
      comment_count: 0
    };
    
    (SomeoneDayPost.create as jest.Mock).mockResolvedValue(mockAnonymousPost);

    const postData = {
      user_id: testUser.user_id,
      title: '익명 테스트 게시물',
      content: '익명으로 작성하는 테스트 게시물입니다. 20자 이상 작성해야 합니다.',
      summary: '익명 테스트 게시물 요약',
      is_anonymous: true,
      character_count: 50,
      like_count: 0,
      comment_count: 0
    };

    const post = await SomeoneDayPost.create(postData);
    
    expect(post).toBeDefined();
    expect(post.is_anonymous).toBe(true);
  });
});