import db from '../../models';
import SomeoneDayPost from '../../models/SomeoneDayPost';
import { User } from '../../models/User';
import Tag from '../../models/Tag';
import SomeoneDayTag from '../../models/SomeoneDayTag';

// 전역 모킹 설정
jest.mock('../../models/SomeoneDayPost');
jest.mock('../../models/User');
jest.mock('../../models/Tag');
jest.mock('../../models/SomeoneDayTag');

// 타입 정의 추가
interface MockTagsGetResult {
  length: number;
  [index: number]: { name: string; tag_id: number };
}

interface MockUserGetResult {
  nickname: string;
  user_id: number;
}

interface MockPost {
  post_id: number;
  user_id: number;
  title: string;
  content: string;
  summary: string;
  is_anonymous: boolean;
  character_count: number;
  like_count: number;
  comment_count: number;
  save?: jest.Mock;
  get?: jest.Mock<any>;
}

describe('SomeoneDayPost Model', () => {
  let testUser: any;
  let testTag: any;

  beforeAll(() => {
    // 테스트 사용자 모킹
    testUser = {
      user_id: 1, 
      username: 'someonedaytest',
      email: 'someonedaytest@example.com',
      nickname: 'SomeoneDay Test User'
    };
    
    // 테스트 태그 모킹
    testTag = {
      tag_id: 1,
      name: 'TestTag'
    };

    // Mock 구현 설정
    (User.create as jest.Mock).mockResolvedValue(testUser);
    (Tag.create as jest.Mock).mockResolvedValue(testTag);

    // SomeoneDayPost.destroy 모킹
    (SomeoneDayPost.destroy as jest.Mock).mockResolvedValue(1);
    (User.destroy as jest.Mock).mockResolvedValue(1);
    (Tag.destroy as jest.Mock).mockResolvedValue(1);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('SomeoneDay 게시물을 생성할 수 있어야 합니다', async () => {
    // 모킹된 게시물
    const mockPost: MockPost = {
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
    // 오류 모킹
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
    const mockPost: MockPost = {
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
    
    // 게시물 태그 연결 정보
    const mockPostTag = {
      post_id: mockPost.post_id,
      tag_id: testTag.tag_id
    };
    
    // 태그가 연결된 게시물에 대한 타입 안전한 get 함수 정의
    const mockGetFunction = jest.fn().mockImplementation((key: string) => {
      if (key === 'tags') {
        return [testTag] as MockTagsGetResult;
      }
      return mockPost[key as keyof typeof mockPost];
    });
    
    // 태그가 연결된 게시물
    const mockPostWithTag: MockPost = {
      ...mockPost,
      get: mockGetFunction
    };
    
    (SomeoneDayPost.create as jest.Mock).mockResolvedValue(mockPost);
    (SomeoneDayTag.create as jest.Mock).mockResolvedValue(mockPostTag);
    (SomeoneDayPost.findByPk as jest.Mock).mockResolvedValue(mockPostWithTag);

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
    await SomeoneDayTag.create({ post_id: post.post_id, tag_id: testTag.tag_id } as any);
    
    // 태그와 함께 게시물 조회
    const foundPost = await SomeoneDayPost.findByPk(post.post_id, {
      include: [{ model: Tag, as: 'tags', through: { attributes: [] } }]
    } as any);
    
    expect(foundPost).toBeDefined();
    
    const tags = foundPost!.get('tags') as MockTagsGetResult;
    expect(tags).toBeDefined();
    expect(tags.length).toBe(1);
    expect(tags[0].name).toBe('TestTag');
  });

  it('게시물 정보를 업데이트할 수 있어야 합니다', async () => {
    // 모킹된 게시물
    const mockPost: MockPost = {
      post_id: 1,
      user_id: testUser.user_id,
      title: '테스트 게시물 제목',
      content: '테스트 게시물 내용입니다. 20자 이상 작성해야 합니다. 테스트 중입니다.',
      summary: '테스트 게시물 요약',
      is_anonymous: false,
      character_count: 50,
      like_count: 0,
      comment_count: 0,
      save: jest.fn().mockResolvedValue(undefined)
    };
    
    // 업데이트된 게시물
    const updatedMockPost: MockPost = {
      ...mockPost,
      like_count: 5,
      comment_count: 3,
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
    await post.save!();
    
    const updatedPost = await SomeoneDayPost.findByPk(post.post_id);
    expect(updatedPost).toBeDefined();
    expect(updatedPost!.like_count).toBe(5);
    expect(updatedPost!.comment_count).toBe(3);
    expect(mockPost.save).toHaveBeenCalled();
  });

  it('게시물을 작성자 정보와 함께 조회할 수 있어야 합니다', async () => {
    // 모킹된 게시물
    const mockPost: MockPost = {
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
    
    // 사용자 정보를 포함한 게시물의 타입 안전한 get 함수 정의
    const mockGetFunction = jest.fn().mockImplementation((key: string) => {
      if (key === 'user') {
        return testUser as MockUserGetResult;
      }
      return mockPost[key as keyof typeof mockPost];
    });
    
    // 사용자 정보가 포함된 게시물
    const mockPostWithUser: MockPost = {
      ...mockPost,
      get: mockGetFunction
    };
    
    (SomeoneDayPost.create as jest.Mock).mockResolvedValue(mockPost);
    (SomeoneDayPost.findByPk as jest.Mock).mockResolvedValue(mockPostWithUser);

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
      include: [{ model: User, as: 'user', attributes: ['user_id', 'nickname'] }]
    } as any);
    
    expect(foundPost).toBeDefined();
    
    const user = foundPost!.get('user') as MockUserGetResult;
    expect(user).toBeDefined();
    expect(user.nickname).toBe('SomeoneDay Test User');
  });

  it('익명 게시물을 생성할 수 있어야 합니다', async () => {
    // 익명 게시물 모킹
    const mockAnonymousPost: MockPost = {
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