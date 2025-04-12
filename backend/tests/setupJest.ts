// setupJest.ts - Fixed version

// 전역 환경 변수 설정
process.env.NODE_ENV = 'test';
process.env.DB_MOCK = 'true';

// 데이터베이스 모킹 - 실제 DB 연결을 방지
jest.mock('../models', () => {
  const mockTransaction = {
    commit: jest.fn().mockResolvedValue(undefined),
    rollback: jest.fn().mockResolvedValue(undefined)
  };

  const mockSequelize = {
    transaction: jest.fn().mockResolvedValue(mockTransaction),
    query: jest.fn().mockResolvedValue([]),
    models: {
      someone_day_posts: {
        findByPk: jest.fn().mockResolvedValue({
          get: jest.fn().mockImplementation((key) => {
            if (key === 'post_id') return 1;
            if (key === 'user_id') return 2;
            if (key === 'is_anonymous') return false;
            return null;
          })
        }),
        increment: jest.fn().mockResolvedValue(undefined),
        create: jest.fn().mockResolvedValue({
          get: jest.fn().mockReturnValue(1)
        })
      },
      encouragement_messages: {
        create: jest.fn().mockResolvedValue({
          get: jest.fn().mockReturnValue(1)
        })
      },
      notifications: {
        create: jest.fn().mockResolvedValue({})
      }
    }
  };

  return {
    sequelize: mockSequelize,
    SomeoneDayPost: {
      create: jest.fn().mockResolvedValue({
        get: jest.fn().mockReturnValue(1)
      }),
      findByPk: jest.fn().mockResolvedValue({
        get: jest.fn().mockImplementation((key) => {
          if (key === 'post_id') return 1;
          if (key === 'user_id') return 2;
          if (key === 'is_anonymous') return false;
          return { post_id: 1, title: '테스트 게시물', content: '내용' };
        })
      }),
      findOne: jest.fn().mockResolvedValue({
        get: jest.fn().mockImplementation((key) => {
          if (key === 'post_id') return 1;
          if (key === 'user_id') return 2;
          if (key === 'is_anonymous') return false;
          if (key === 'encouragement_messages') return [];
          return { post_id: 1, title: '테스트 게시물', content: '내용' };
        })
      }),
      findAll: jest.fn().mockResolvedValue([
        {
          get: jest.fn().mockReturnValue({
            post_id: 1,
            title: '게시물 1',
            content: '내용 1',
            is_anonymous: false,
            user: { nickname: '사용자1' }
          })
        }
      ]),
      findAndCountAll: jest.fn().mockResolvedValue({
        count: 2,
        rows: [
          {
            get: jest.fn().mockReturnValue({
              post_id: 1,
              title: '게시물 1',
              content: '내용 1',
              is_anonymous: false,
              user: { nickname: '사용자1' }
            })
          },
          {
            get: jest.fn().mockReturnValue({
              post_id: 2,
              title: '게시물 2',
              content: '내용 2',
              is_anonymous: true,
              user: null
            })
          }
        ]
      })
    },
    Tag: {
        findAll: jest.fn().mockImplementation((options) => {
          // 테스트 id=3이 있으면 일부만 반환하여 유효성 검사 실패 시뮬레이션
          const ids = options?.where?.tag_id?.['Op.in'] || [];
          if (ids.includes(3)) {
            return Promise.resolve([{ tag_id: 1 }]);
          }
          return Promise.resolve(
            ids.map((id: number) => ({ get: () => ({ tag_id: id, name: `태그${id}` }) }))
          );
        })
      },
    SomeoneDayTag: {
      bulkCreate: jest.fn().mockResolvedValue([])
    },
    User: {
      findByPk: jest.fn().mockResolvedValue({
        user_id: 1,
        nickname: '테스트사용자',
        email: 'test@example.com'
      })
    },
    EncouragementMessage: {
      create: jest.fn().mockResolvedValue({
        get: jest.fn().mockReturnValue(1)
      })
    },
    PostReport: {
      create: jest.fn().mockResolvedValue({}),
      findOne: jest.fn().mockImplementation((options) => {
        // id=1인 경우 이미 신고한 것으로 처리
        if (options?.where?.post_id === '1') {
          return Promise.resolve({ report_id: 1 });
        }
        return Promise.resolve(null);
      })
    }
  };
});

// 테스트 유틸리티 함수들
export const mockCreateTestUser = () => ({
  user: { user_id: 1, nickname: '테스트사용자' },
  token: 'mock-token',
  userId: 1
});

// setup.ts 모킹
jest.mock('../tests/setup', () => ({
  createTestUser: jest.fn().mockImplementation(mockCreateTestUser),
  setupTestDB: jest.fn().mockImplementation(() => {
    console.log('테스트 DB 설정이 완료되었습니다 (모의)');
  })
}));

// 콘솔 오류 억제
// console.error = jest.fn();