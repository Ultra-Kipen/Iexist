// tests/jest.setup.js
// Jest 테스트를 위한 전역 모킹 설정

// Jest 테스트 환경 설정
process.env.NODE_ENV = 'test';
process.env.DB_MOCK = 'true';

// models 모듈에 대한 전역 모킹 설정
jest.mock('../models', () => {
  const mockTransaction = {
    commit: jest.fn().mockResolvedValue(undefined),
    rollback: jest.fn().mockResolvedValue(undefined)
  };

  const Op = {
    in: Symbol.for('Op.in'),
    between: Symbol.for('Op.between'),
    lte: Symbol.for('Op.lte'),
    gte: Symbol.for('Op.gte'),
    lt: Symbol.for('Op.lt'),
    gt: Symbol.for('Op.gt'),
    ne: Symbol.for('Op.ne'),
    or: Symbol.for('Op.or')
  };

  return {
    Op,
    sequelize: {
      transaction: jest.fn().mockResolvedValue(mockTransaction),
      authenticate: jest.fn().mockResolvedValue(true),
      query: jest.fn().mockResolvedValue([]),
      sync: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
      models: {
        users: {
          findByPk: jest.fn().mockResolvedValue(null)
        },
        someone_day_posts: {
          findByPk: jest.fn().mockResolvedValue({
            get: jest.fn().mockImplementation((key) => {
              if (key === 'post_id') return 1;
              if (key === 'user_id') return 2;
              return null;
            })
          }),
          increment: jest.fn().mockResolvedValue(undefined),
          findOne: jest.fn().mockResolvedValue({})
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
    },
    SomeoneDayPost: {
      create: jest.fn().mockResolvedValue({
        get: jest.fn().mockReturnValue(1)
      }),
      findByPk: jest.fn().mockImplementation((id) => {
        if (id === '999') return null;
        return {
          get: jest.fn().mockImplementation((key) => {
            if (key === 'post_id') return 1;
            if (key === 'user_id') return 2;
            if (key === 'is_anonymous') return false;
            if (key === 'user') return { nickname: '사용자' };
            return { post_id: 1, title: '테스트' };
          })
        };
      }),
      findOne: jest.fn().mockResolvedValue({
        get: jest.fn().mockImplementation((key) => {
          if (key === 'is_anonymous') return false;
          if (key === 'user') return { nickname: '사용자' };
          if (key === 'encouragement_messages') return [];
          return { post_id: 1, title: '테스트' };
        })
      }),
      findAll: jest.fn().mockResolvedValue([
        {
          get: jest.fn().mockReturnValue({
            post_id: 1,
            title: '인기 게시물',
            is_anonymous: false,
            user: { nickname: '사용자' },
            tags: []
          })
        }
      ]),
      findAndCountAll: jest.fn().mockResolvedValue({
        rows: [
          {
            get: jest.fn().mockImplementation((option) => {
              if (option && option.plain) return { post_id: 1, title: '테스트' };
              return { post_id: 1, title: '테스트', is_anonymous: false, user: { nickname: '사용자' } };
            })
          }
        ],
        count: 1
      })
    },
    SomeoneDayTag: {
      bulkCreate: jest.fn().mockResolvedValue([])
    },
    Tag: {
      findAll: jest.fn().mockImplementation((options) => {
        if (options && options.where && options.where.tag_id) {
          const tagIds = options.where.tag_id[Symbol.for('Op.in')];
          if (tagIds.includes(3)) {
            // tag_id 3을 포함하면 1개만 반환
            return [{ get: () => ({ tag_id: 1, name: '태그1' }) }];
          }
          // 그렇지 않으면 모든 태그 반환
          return tagIds.map((id: number) => ({ get: () => ({ tag_id: id, name: `태그${id}` }) }));
        }
        return [];
      })
    },
    User: {
      findByPk: jest.fn().mockResolvedValue({
        get: jest.fn().mockReturnValue({ nickname: '사용자' })
      }),
      create: jest.fn().mockResolvedValue({
        get: jest.fn().mockReturnValue(1)
      })
    },
    PostReport: {
      create: jest.fn().mockResolvedValue({}),
      findOne: jest.fn().mockImplementation((options) => {
        if (options && options.where && options.where.post_id === '1') {
          return { report_id: 1 };
        }
        return null;
      })
    },
    UserStats: {
      create: jest.fn().mockResolvedValue({}),
      increment: jest.fn().mockResolvedValue({})
    },
    Emotion: {
      findAll: jest.fn().mockResolvedValue([]),
      bulkCreate: jest.fn().mockResolvedValue([])
    },
    MyDayPost: {
      findByPk: jest.fn().mockResolvedValue(null)
    }
  };
});