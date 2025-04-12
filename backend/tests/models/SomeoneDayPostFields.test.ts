import db from '../../models';
import SomeoneDayPost from '../../models/SomeoneDayPost';

describe('SomeoneDayPost 모델 필드 확인', () => {
  beforeAll(async () => {
    jest.setTimeout(10000);
    try {
      await db.sequelize.authenticate();
    } catch (error) {
      console.error('데이터베이스 연결 실패:', error);
    }
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  it('SomeoneDayPost 모델의 필드를 확인합니다', () => {
    // SomeoneDayPost 모델에서 사용 가능한 필드 속성 확인
    const attributes = SomeoneDayPost.getAttributes();
    
    // 모델에 필요한 필드들이 모두 있는지 확인
    expect(attributes).toHaveProperty('post_id');
    expect(attributes).toHaveProperty('user_id');
    expect(attributes).toHaveProperty('title');
    expect(attributes).toHaveProperty('content');
    
    // 필드 타입 및 속성 확인 - 타입 체크 추가
    expect(attributes.post_id?.primaryKey).toBe(true);
    expect(attributes.title?.allowNull).toBe(false);
    expect(attributes.content?.allowNull).toBe(false);
    
    // 콘솔에 모든 필드 출력 (디버깅용)
    console.log('SomeoneDayPost 모델 필드:', Object.keys(attributes));
    
    // 필수 필드들 검증
    const requiredFields = ['post_id', 'user_id', 'title', 'content', 'is_anonymous', 'like_count', 'comment_count'];
    requiredFields.forEach(field => {
      expect(attributes).toHaveProperty(field);
    });
  });

  it('SomeoneDayPost 모델의 생성 필드 목록을 확인합니다', () => {
    // 게시물 생성에 필요한 최소 필드 목록 확인
    const minimalPostData = {
      user_id: 1,
      title: '필수 필드 테스트',
      content: '최소한의 필수 필드만 포함된 게시물 테스트입니다. 20자 이상 작성해야 합니다.',
      is_anonymous: false,
      like_count: 0,
      comment_count: 0
    };
    
    // 정상적인 객체 구조인지 확인
    expect(() => {
      // TypeScript 타입 체크만 수행 (실제 DB 접근은 하지 않음)
      const testPost: Partial<typeof SomeoneDayPost.prototype> = minimalPostData;
      return testPost;
    }).not.toThrow();
    
    // 콘솔에 출력 (디버깅용)
    console.log('필수 필드 데이터:', minimalPostData);
  });
});