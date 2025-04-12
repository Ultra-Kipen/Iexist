// someoneDayControllerMock.ts
// 테스트에서 사용할 모의 객체들

export const mockSomeoneDayPost = {
    post_id: 1,
    user_id: 2,
    title: '테스트 게시물',
    content: '테스트 내용입니다.',
    is_anonymous: false,
    like_count: 10,
    comment_count: 5,
    created_at: new Date(),
    updated_at: new Date()
  };
  
  export const mockPostModel = {
    get: (key?: string) => {
      if (!key) return mockSomeoneDayPost;
      if (key === 'post_id') return mockSomeoneDayPost.post_id;
      if (key === 'user_id') return mockSomeoneDayPost.user_id;
      if (key === 'is_anonymous') return mockSomeoneDayPost.is_anonymous;
      if (key === 'encouragement_messages') return [];
      return mockSomeoneDayPost;
    }
  };
  
  export const mockDbSetup = () => {
    // 사용자 데이터
    const testUser = {
      user_id: 1,
      nickname: '테스트사용자',
      profile_image_url: null
    };
  
    // 트랜잭션 모의 객체
    const mockTransaction = {
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined)
    };
  
    // DB 모의 설정
    jest.mock('../../models', () => {
      return {
        sequelize: {
          transaction: jest.fn().mockResolvedValue(mockTransaction),
          models: {
            someone_day_posts: {
              findByPk: jest.fn().mockImplementation((id: string) => {
                return Promise.resolve(id === '999' ? null : mockPostModel);
              }),
              increment: jest.fn().mockResolvedValue(undefined),
              create: jest.fn().mockImplementation(() => {
                return Promise.resolve({
                  get: jest.fn().mockReturnValue(1)
                });
              })
            },
            encouragement_messages: {
              create: jest.fn().mockImplementation(() => {
                return Promise.resolve({
                  get: jest.fn().mockReturnValue(1)
                });
              })
            },
            notifications: {
              create: jest.fn().mockResolvedValue({})
            }
          }
        },
        SomeoneDayPost: {
          create: jest.fn().mockImplementation(() => {
            return Promise.resolve({
              get: jest.fn().mockReturnValue(1)
            });
          }),
          findByPk: jest.fn().mockImplementation((id: string) => {
            return Promise.resolve(id === '999' ? null : mockPostModel);
          }),
          findOne: jest.fn().mockImplementation((options: any) => {
            const id = options?.where?.post_id;
            return Promise.resolve(id === '999' ? null : mockPostModel);
          }),
          findAll: jest.fn().mockResolvedValue([mockPostModel]),
          findAndCountAll: jest.fn().mockResolvedValue({
            count: 2,
            rows: [mockPostModel, mockPostModel]
          })
        },
        Tag: {
          findAll: jest.fn().mockImplementation((options: any) => {
            const ids = options?.where?.tag_id?.['Op.in'] || [];
            if (ids.includes(3)) {
              return Promise.resolve([{ tag_id: 1, name: '태그1' }]);
            }
            return Promise.resolve(
              ids.map((id: number) => ({ tag_id: id, name: `태그${id}` }))
            );
          })
        },
        SomeoneDayTag: {
          bulkCreate: jest.fn().mockResolvedValue([])
        },
        User: {
          findByPk: jest.fn().mockResolvedValue(testUser)
        },
        EncouragementMessage: {
          create: jest.fn().mockResolvedValue({
            get: jest.fn().mockReturnValue(1)
          })
        },
        PostReport: {
          create: jest.fn().mockResolvedValue({}),
          findOne: jest.fn().mockImplementation((options: any) => {
            if (options?.where?.post_id === '1') {
              return Promise.resolve({ report_id: 1 });
            }
            return Promise.resolve(null);
          })
        }
      };
    });
  };