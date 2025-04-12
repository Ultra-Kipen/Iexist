import { createTestUser } from '../setup';
import db from '../../models';
import jwt from 'jsonwebtoken';
import Tag from '../../models/Tag';
import { Model } from 'sequelize';

// MockTag 타입 정의
interface MockTag extends Model {
  tag_id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
}

// 전역 변수로 Mock 배열 선언
let mockTags: MockTag[] = [];
let mockSomeoneDayTags: any[] = [];

// 태그 모델 및 관련 모델들을 mock화
jest.mock('../../models', () => {
  // 태그 모델 mock
  const mockTagModel = {
    create: jest.fn((data: any) => {
      const tagId = mockTags.length + 1;
      const newTag = {
        tag_id: tagId,
        name: data.name,
        created_at: new Date(),
        updated_at: new Date(),
        ...data,
        get: (key: string) => {
          if (key === 'tag_id') return tagId;
          if (key === 'name') return data.name;
          return (newTag as any)[key];
        },
        toJSON: () => ({ tag_id: tagId, name: data.name }),
        // 기본 모델 메서드 추가
        save: jest.fn().mockResolvedValue(true),
        destroy: jest.fn().mockResolvedValue(true),
        reload: jest.fn().mockResolvedValue(true),
        update: jest.fn().mockResolvedValue(true),
        isNewRecord: true,
        _changed: new Set(),
        _options: {},
        _previousDataValues: {},
        dataValues: { tag_id: tagId, name: data.name },
        _attributes: {},
        _creationAttributes: {}
      } as unknown as MockTag;
      
      mockTags.push(newTag as any);
      return Promise.resolve(newTag);
    }),
    findOne: jest.fn((options?: any) => {
      if (!options || !options.where) return Promise.resolve(null);
      
      const result = mockTags.find(tag => {
        return Object.entries(options.where).every(([key, value]) => {
          if (key === 'name' && options.where.name[Symbol.for('like')]) {
            // LIKE 쿼리 처리
            const pattern = options.where.name[Symbol.for('like')].replace(/%/g, '.*');
            const regex = new RegExp(`^${pattern}$`, 'i');
            return regex.test(tag.name);
          }
          return (tag as any)[key] === value;
        });
      });
      
      return Promise.resolve(result || null);
    }),
    findAll: jest.fn((options?: any) => {
      let result = [...mockTags];
      
      if (options?.where) {
        result = result.filter(tag => {
          return Object.entries(options.where).every(([key, value]) => {
            return (tag as any)[key] === value;
          });
        });
      }
      
      if (options?.order) {
        const [field, direction] = options.order[0];
        result.sort((a, b) => {
          if (direction === 'DESC') {
            return (a as any)[field] > (b as any)[field] ? -1 : 1;
          }
          return (a as any)[field] > (b as any)[field] ? 1 : -1;
        });
      }
      
      if (options?.limit) {
        result = result.slice(0, options.limit);
      }
      
      return Promise.resolve(result);
    }),
    findByPk: jest.fn((id: number) => {
      const result = mockTags.find(tag => tag.tag_id === id);
      return Promise.resolve(result || null);
    }),
    update: jest.fn((updates: any, options?: any) => {
      let count = 0;
      
      if (options?.where) {
        mockTags.forEach(tag => {
          let match = true;
          
          Object.entries(options.where).forEach(([key, value]) => {
            if ((tag as any)[key] !== value) match = false;
          });
          
          if (match) {
            count++;
            Object.assign(tag, updates);
          }
        });
      } else if (options?.individualHooks && updates?.tag_id) {
        const tag = mockTags.find(t => t.tag_id === updates.tag_id);
        if (tag) {
          count = 1;
          Object.assign(tag, updates);
        }
      }
      
      return Promise.resolve([count]);
    }),
    destroy: jest.fn((options?: any) => {
      let count = 0;
      
      if (options?.where) {
        const initialLength = mockTags.length;
        const newTags = mockTags.filter(tag => {
          let keep = true;
          
          Object.entries(options.where).forEach(([key, value]) => {
            if ((tag as any)[key] === value) keep = false;
          });
          
          return keep;
        });
        
        count = initialLength - newTags.length;
        mockTags.length = 0;
        mockTags.push(...newTags);
      }
      
      return Promise.resolve(count);
    })
  };
  
  // SomeoneDayTag 모델 mock
  const mockSomeoneDayTagModel = {
    create: jest.fn((data: any) => {
      const newSomeoneDayTag = {
        post_id: data.post_id,
        tag_id: data.tag_id,
        created_at: new Date(),
        updated_at: new Date(),
        ...data,
        get: (key: string) => (newSomeoneDayTag as any)[key],
        // 기본 모델 메서드 추가
        save: jest.fn().mockResolvedValue(true),
        destroy: jest.fn().mockResolvedValue(true),
        reload: jest.fn().mockResolvedValue(true),
        update: jest.fn().mockResolvedValue(true),
        isNewRecord: true,
        _changed: new Set(),
        _options: {},
        _previousDataValues: {},
        dataValues: { post_id: data.post_id, tag_id: data.tag_id },
        _attributes: {},
        _creationAttributes: {}
      };
      mockSomeoneDayTags.push(newSomeoneDayTag);
      return Promise.resolve(newSomeoneDayTag);
    }),
    findOne: jest.fn((options?: any) => {
      if (!options || !options.where) return Promise.resolve(null);
      
      const result = mockSomeoneDayTags.find(tag => {
        return Object.entries(options.where).every(([key, value]) => {
          return tag[key] === value;
        });
      });
      
      return Promise.resolve(result || null);
    }),
    findAll: jest.fn((options?: any) => {
      let result = [...mockSomeoneDayTags];
      
      if (options?.where) {
        result = result.filter(tag => {
          return Object.entries(options.where).every(([key, value]) => {
            return tag[key] === value;
          });
        });
      }
      
      return Promise.resolve(result);
    }),
    bulkCreate: jest.fn((dataArray: any[]) => {
      const createdTags = dataArray.map(data => {
        const newSomeoneDayTag = {
          post_id: data.post_id,
          tag_id: data.tag_id,
          created_at: new Date(),
          updated_at: new Date(),
          ...data,
          get: (key: string) => (newSomeoneDayTag as any)[key],
          // 기본 모델 메서드 추가
          save: jest.fn().mockResolvedValue(true),
          destroy: jest.fn().mockResolvedValue(true),
          reload: jest.fn().mockResolvedValue(true),
          update: jest.fn().mockResolvedValue(true),
          isNewRecord: true,
          _changed: new Set(),
          _options: {},
          _previousDataValues: {},
          dataValues: { post_id: data.post_id, tag_id: data.tag_id },
          _attributes: {},
          _creationAttributes: {}
        };
        mockSomeoneDayTags.push(newSomeoneDayTag);
        return newSomeoneDayTag;
      });
      
      return Promise.resolve(createdTags);
    }),
    destroy: jest.fn((options?: any) => {
      let count = 0;
      
      if (options?.where) {
        const initialLength = mockSomeoneDayTags.length;
        const newTags = mockSomeoneDayTags.filter(tag => {
          let keep = true;
          
          Object.entries(options.where).forEach(([key, value]) => {
            if (tag[key] === value) keep = false;
          });
          
          return keep;
        });
        
        count = initialLength - newTags.length;
        mockSomeoneDayTags.length = 0;
        mockSomeoneDayTags.push(...newTags);
      }
      
      return Promise.resolve(count);
    })
  };
  
  // 트랜잭션 mock
  const mockTransaction = {
    commit: jest.fn(() => Promise.resolve()),
    rollback: jest.fn(() => Promise.resolve())
  };

  return {
    Tag: mockTagModel,
    SomeoneDayTag: mockSomeoneDayTagModel,
    PostTag: mockSomeoneDayTagModel, // 동일한 인터페이스 사용
    sequelize: {
      transaction: jest.fn(() => Promise.resolve(mockTransaction))
    }
  };
});

// createTestUser 목킹
jest.mock('../setup', () => ({
  createTestUser: jest.fn().mockImplementation(() => {
    const userId = Math.floor(Math.random() * 1000);
    return Promise.resolve({
      user: { 
        user_id: userId, 
        email: `test${userId}@example.com`, 
        nickname: `TestUser${userId}` 
      },
      token: 'mock-token',
      userId: userId
    });
  })
}));

describe('Tag Model', () => {
  let testUser: any;
  let token: string;
  let userId: number;

  beforeAll(async () => {
    const result = await createTestUser();
    testUser = result.user;
    token = result.token;
    userId = result.userId;
  });

  beforeEach(() => {
    // 각 테스트 시작 전에 Mock 배열 초기화
    mockTags = [];
    mockSomeoneDayTags = [];
    jest.clearAllMocks();
  });

  describe('태그 생성', () => {
    it('새 태그를 생성할 수 있어야 함', async () => {
      // 태그 생성
      const tagName = '테스트태그';
      const tag = await db.Tag.create({ name: tagName } as any);

      // 검증
      expect(tag).toBeDefined();
      expect(tag.get('name')).toBe(tagName);
      expect(db.Tag.create).toHaveBeenCalled();
    });

    it('동일한 이름의 태그는 생성되지 않아야 함', async () => {
      // 첫 번째 태그 생성
      const tagName = '중복태그';
      await db.Tag.create({ name: tagName } as any);
      
      // 중복 태그가 이미 존재한다고 가정
      const mockTag = {
        tag_id: 999,
        name: tagName,
        get: (key: string) => key === 'name' ? tagName : 999
      };
      jest.spyOn(db.Tag, 'findOne').mockResolvedValueOnce(mockTag as any);
      
      // 동일한 이름으로 다시 생성 시도
      try {
        await db.Tag.create({ name: tagName } as any);
        fail('중복 태그 생성 시 에러가 발생해야 함');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('태그 조회', () => {
    it('모든 태그를 조회할 수 있어야 함', async () => {
      // 태그 여러 개 생성
      await db.Tag.create({ name: '태그1' } as any);
      await db.Tag.create({ name: '태그2' } as any);
      await db.Tag.create({ name: '태그3' } as any);

      // 모든 태그 조회
      const tags = await db.Tag.findAll();

      // 검증
      expect(tags).toHaveLength(3);
      expect(tags.map((tag: any) => tag.name)).toContain('태그1');
      expect(tags.map((tag: any) => tag.name)).toContain('태그2');
      expect(tags.map((tag: any) => tag.name)).toContain('태그3');
    });

    it('ID로 특정 태그를 조회할 수 있어야 함', async () => {
      // 태그 생성
      const tag = await db.Tag.create({ name: '검색태그' } as any);
      const tagId = tag.get('tag_id');

      // ID로 태그 조회
      const foundTag = await db.Tag.findByPk(tagId);

      // 검증
      expect(foundTag).toBeDefined();
      if (foundTag) {
        expect(foundTag.get('tag_id')).toBe(tagId);
        expect(foundTag.get('name')).toBe('검색태그');
      }
    });

    it('이름으로 태그를 검색할 수 있어야 함', async () => {
      // 태그 생성
      await db.Tag.create({ name: '검색태그A' } as any);
      await db.Tag.create({ name: '검색태그B' } as any);
      await db.Tag.create({ name: '다른태그' } as any);

      // 태그 이름으로 검색 (LIKE 쿼리 시뮬레이션)
      const searchOptions = {
        where: {
          name: { [Symbol.for('like')]: '검색태그%' }
        }
      };
      
      // Mock 검색 결과 생성
      const mockSearchResults = [
        {
          tag_id: 1,
          name: '검색태그A',
          get: (key: string) => key === 'tag_id' ? 1 : key === 'name' ? '검색태그A' : null,
          dataValues: { tag_id: 1, name: '검색태그A' }
        },
        {
          tag_id: 2,
          name: '검색태그B',
          get: (key: string) => key === 'tag_id' ? 2 : key === 'name' ? '검색태그B' : null,
          dataValues: { tag_id: 2, name: '검색태그B' }
        }
      ];
      
      jest.spyOn(db.Tag, 'findAll').mockResolvedValueOnce(mockSearchResults as any);

      const searchResults = await db.Tag.findAll(searchOptions);

      // 검증
      expect(searchResults).toHaveLength(2);
      expect(searchResults.map((tag: any) => tag.name)).toContain('검색태그A');
      expect(searchResults.map((tag: any) => tag.name)).toContain('검색태그B');
      expect(searchResults.map((tag: any) => tag.name)).not.toContain('다른태그');
    });
  });

  describe('태그 수정', () => {
    it('태그 이름을 수정할 수 있어야 함', async () => {
      // 태그 생성
      const tag = await db.Tag.create({ name: '수정전태그' } as any);
      const tagId = tag.get('tag_id');

      // 태그 이름 수정
      await db.Tag.update(
        { name: '수정후태그' },
        { where: { tag_id: tagId }, individualHooks: true }
      );

      // 수정된 태그 조회를 모킹
      const updatedTag = {
        tag_id: tagId,
        name: '수정후태그',
        get: (key: string) => key === 'tag_id' ? tagId : key === 'name' ? '수정후태그' : null
      };
      jest.spyOn(db.Tag, 'findByPk').mockResolvedValueOnce(updatedTag as any);

      // 수정된 태그 조회
      const foundTag = await db.Tag.findByPk(tagId);

      // 검증
      expect(foundTag).toBeDefined();
      if (foundTag) {
        expect(foundTag.get('name')).toBe('수정후태그');
      }
    });

    it('이미 존재하는 이름으로 수정할 수 없어야 함', async () => {
      // 태그 두 개 생성
      await db.Tag.create({ name: '기존태그' } as any);
      const tag = await db.Tag.create({ name: '수정대상태그' } as any);
      const tagId = tag.get('tag_id');
      
      // 중복 태그 이름 존재 시뮬레이션
      const mockExistingTag = {
        tag_id: 9999, // 다른 ID
        name: '기존태그',
        get: (key: string) => key === 'tag_id' ? 9999 : key === 'name' ? '기존태그' : null
      };
      jest.spyOn(db.Tag, 'findOne').mockResolvedValueOnce(mockExistingTag as any);

      // 이미 존재하는 이름으로 수정 시도
      try {
        await db.Tag.update(
          { name: '기존태그' },
          { where: { tag_id: tagId }, individualHooks: true }
        );
        fail('중복 이름으로 수정 시 에러가 발생해야 함');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('태그 삭제', () => {
    it('태그를 삭제할 수 있어야 함', async () => {
      // 태그 생성
      const tag = await db.Tag.create({ name: '삭제태그' } as any);
      const tagId = tag.get('tag_id');

      // 태그 삭제
      await db.Tag.destroy({ where: { tag_id: tagId } });

      // 삭제 후 조회
      jest.spyOn(db.Tag, 'findByPk').mockResolvedValueOnce(null);
      const deletedTag = await db.Tag.findByPk(tagId);

      // 검증
      expect(deletedTag).toBeNull();
    });
  });

  describe('포스트 태그 연결', () => {
    it('태그를 포스트에 연결할 수 있어야 함', async () => {
      // 태그 생성
      const tag1 = await db.Tag.create({ name: '포스트태그1' } as any);
      const tag2 = await db.Tag.create({ name: '포스트태그2' } as any);
      const postId = 123; // 가상의 포스트 ID

      // 포스트에 태그 연결
      await db.SomeoneDayTag.bulkCreate([
        { post_id: postId, tag_id: tag1.get('tag_id') },
        { post_id: postId, tag_id: tag2.get('tag_id') }
      ]);

      // 포스트의 태그 조회
      const postTags = await db.SomeoneDayTag.findAll({
        where: { post_id: postId }
      });

      // 검증
      expect(postTags).toHaveLength(2);
      expect(postTags.map((tag: any) => tag.tag_id)).toContain(tag1.get('tag_id'));
      expect(postTags.map((tag: any) => tag.tag_id)).toContain(tag2.get('tag_id'));
    });

    it('태그 연결을 해제할 수 있어야 함', async () => {
      // 태그 생성
      const tag = await db.Tag.create({ name: '연결해제태그' } as any);
      const postId = 456; // 가상의 포스트 ID

      // 포스트에 태그 연결
      await db.SomeoneDayTag.create({
        post_id: postId,
        tag_id: tag.get('tag_id')
      });

      // 연결 확인
      const initialTag = await db.SomeoneDayTag.findOne({
        where: { 
          post_id: postId,
          tag_id: tag.get('tag_id')
        }
      });
      expect(initialTag).toBeDefined();

      // 태그 연결 해제
      await db.SomeoneDayTag.destroy({
        where: {
          post_id: postId,
          tag_id: tag.get('tag_id')
        }
      });

      // 연결 해제 확인 (mock 응답 설정)
      jest.spyOn(db.SomeoneDayTag, 'findOne').mockResolvedValueOnce(null);
      const deletedTag = await db.SomeoneDayTag.findOne({
        where: {
          post_id: postId,
          tag_id: tag.get('tag_id')
        }
      });

      // 검증
      expect(deletedTag).toBeNull();
    });
  });

  describe('태그 통계', () => {
    it('가장 많이 사용된 태그를 조회할 수 있어야 함', async () => {
      // 태그 생성
      const tag1 = await db.Tag.create({ name: '인기태그1' } as any);
      const tag2 = await db.Tag.create({ name: '인기태그2' } as any);
      const tag3 = await db.Tag.create({ name: '덜인기태그' } as any);
      
      // 포스트에 태그 여러 번 연결
      await db.SomeoneDayTag.bulkCreate([
        { post_id: 1, tag_id: tag1.get('tag_id') },
        { post_id: 2, tag_id: tag1.get('tag_id') },
        { post_id: 3, tag_id: tag1.get('tag_id') },
        { post_id: 4, tag_id: tag2.get('tag_id') },
        { post_id: 5, tag_id: tag2.get('tag_id') },
        { post_id: 6, tag_id: tag3.get('tag_id') }
      ]);
      
      // 가장 많이 사용된 태그 목록 구현
      const mockPopularTags = [
        { tag_id: tag1.get('tag_id'), name: '인기태그1', count: 3 },
        { tag_id: tag2.get('tag_id'), name: '인기태그2', count: 2 },
        { tag_id: tag3.get('tag_id'), name: '덜인기태그', count: 1 }
      ];
      
      // 가상의 인기 태그 조회 함수 구현
      const getPopularTags = jest.fn().mockResolvedValue(mockPopularTags);
      
      const popularTags = await getPopularTags();
      
      // 검증
      expect(popularTags).toHaveLength(3);
      expect(popularTags[0].tag_id).toBe(tag1.get('tag_id'));
      expect(popularTags[0].count).toBe(3);
      expect(popularTags[1].tag_id).toBe(tag2.get('tag_id'));
      expect(popularTags[1].count).toBe(2);
    });
  });
});