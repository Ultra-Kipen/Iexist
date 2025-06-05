// tests/performance/database-bottleneck.test.ts
import db from '../../models';
import { QueryTypes, Op } from 'sequelize';

describe('데이터베이스 성능 병목 테스트', () => {
  let testUsers: any[] = [];
  let testPosts: any[] = [];

  beforeAll(async () => {
    // 대량 테스트 데이터 생성
    console.log('대량 테스트 데이터 생성 중...');
    
    // 테스트 사용자 100명 생성
    const users = [];
    for (let i = 0; i < 100; i++) {
      users.push({
        username: `perftest_user_${i}`,
        email: `perftest${i}@test.com`,
        password_hash: 'hashedpassword',
        nickname: `성능테스트${i}`,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        notification_settings: {
          like_notifications: true,
          comment_notifications: true,
          challenge_notifications: true,
          encouragement_notifications: true
        }
      });
    }
    
    testUsers = await db.User.bulkCreate(users, { returning: true });
    
    // 각 사용자당 10개의 게시물 생성 (총 1000개)
    const posts = [];
    for (const user of testUsers) {
      for (let j = 0; j < 10; j++) {
        posts.push({
          user_id: user.user_id,
          content: `성능 테스트 게시물 ${j} - 사용자 ${user.username}`,
          emotion_summary: j % 5 === 0 ? '행복' : j % 5 === 1 ? '슬픔' : j % 5 === 2 ? '화남' : j % 5 === 3 ? '불안' : '편함',
          is_anonymous: j % 3 === 0,
          like_count: Math.floor(Math.random() * 50),
          comment_count: Math.floor(Math.random() * 20)
        });
      }
    }
    
    testPosts = await db.MyDayPost.bulkCreate(posts, { returning: true });
    console.log(`테스트 데이터 생성 완료: 사용자 ${testUsers.length}명, 게시물 ${testPosts.length}개`);
  });

  afterAll(async () => {
    // 테스트 데이터 정리
    console.log('테스트 데이터 정리 중...');
    
    const userIds = testUsers.map(u => u.user_id);
    
    await db.MyDayPost.destroy({ 
      where: { user_id: userIds }
    });
    
    await db.User.destroy({ 
      where: { user_id: userIds }
    });
    
    console.log('테스트 데이터 정리 완료');
  });

  test('대용량 데이터 조회 성능 테스트', async () => {
    const startTime = Date.now();
    
    // 페이지네이션 없이 전체 게시물 조회 (include 없이 성능 테스트)
    const allPosts = await db.MyDayPost.findAll({
      order: [['created_at', 'DESC']]
    });
    
    const endTime = Date.now();
    const queryTime = endTime - startTime;
    
    console.log(`전체 게시물 조회 시간: ${queryTime}ms`);
    console.log(`조회된 게시물 수: ${allPosts.length}`);
    
    // 1초 이내에 조회되어야 함
    expect(queryTime).toBeLessThan(1000);
    expect(allPosts.length).toBeGreaterThan(0);
  });

  test('페이지네이션 성능 테스트', async () => {
    const PAGE_SIZE = 20;
    const PAGE_COUNT = 10;
    const queryTimes: number[] = [];

    for (let page = 0; page < PAGE_COUNT; page++) {
      const startTime = Date.now();
      
      await db.MyDayPost.findAll({
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
        order: [['created_at', 'DESC']]
      });
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      queryTimes.push(queryTime);
    }

    const avgQueryTime = queryTimes.reduce((a, b) => a + b, 0) / queryTimes.length;
    const maxQueryTime = Math.max(...queryTimes);
    
    console.log(`페이지네이션 평균 조회 시간: ${avgQueryTime.toFixed(2)}ms`);
    console.log(`페이지네이션 최대 조회 시간: ${maxQueryTime}ms`);
    
    // 평균 200ms, 최대 500ms 이내
    expect(avgQueryTime).toBeLessThan(200);
    expect(maxQueryTime).toBeLessThan(500);
  });

  test('복잡한 조인 쿼리 성능 테스트', async () => {
    const startTime = Date.now();
    
    // 사용자, 게시물, 감정 정보를 모두 조인하는 복잡한 쿼리
    const complexQuery = await db.sequelize.query(`
      SELECT 
        u.username,
        u.nickname,
        COUNT(DISTINCT p.post_id) as post_count,
        AVG(p.like_count) as avg_likes,
        MAX(p.created_at) as last_post_date
      FROM users u
      LEFT JOIN my_day_posts p ON u.user_id = p.user_id
      WHERE u.user_id IN (${testUsers.slice(0, 50).map(u => u.user_id).join(',')})
      GROUP BY u.user_id, u.username, u.nickname
      ORDER BY post_count DESC, avg_likes DESC
      LIMIT 20
    `, {
      type: QueryTypes.SELECT
    });
    
    const endTime = Date.now();
    const queryTime = endTime - startTime;
    
    console.log(`복잡한 조인 쿼리 시간: ${queryTime}ms`);
    console.log(`결과 수: ${complexQuery.length}`);
    
    // 500ms 이내에 완료되어야 함
    expect(queryTime).toBeLessThan(500);
    expect(complexQuery.length).toBeGreaterThan(0);
  });

  test('인덱스 효율성 테스트', async () => {
    // 인덱싱된 컬럼으로 검색
    const indexedSearchStart = Date.now();
    await db.MyDayPost.findAll({
      where: { user_id: testUsers[0].user_id },
      order: [['created_at', 'DESC']]
    });
    const indexedSearchTime = Date.now() - indexedSearchStart;

    // 인덱싱되지 않은 컬럼으로 검색 (content LIKE 검색)
    const nonIndexedSearchStart = Date.now();
    await db.MyDayPost.findAll({
      where: {
        content: {
          [Op.like]: '%성능 테스트%'
        }
      }
    });
    const nonIndexedSearchTime = Date.now() - nonIndexedSearchStart;

    console.log(`인덱싱된 검색 시간: ${indexedSearchTime}ms`);
    console.log(`인덱싱되지 않은 검색 시간: ${nonIndexedSearchTime}ms`);

    // 인덱싱된 검색이 더 빨라야 함
    expect(indexedSearchTime).toBeLessThan(100);
    // 인덱싱되지 않은 검색도 합리적인 시간 내에 완료
    expect(nonIndexedSearchTime).toBeLessThan(1000);
  });

  test('동시 연결 처리 성능 테스트', async () => {
    const CONCURRENT_QUERIES = 20;
    const queryPromises: Promise<any>[] = [];

    const startTime = Date.now();

    // 동시에 여러 쿼리 실행
    for (let i = 0; i < CONCURRENT_QUERIES; i++) {
      const queryPromise = db.MyDayPost.findAll({
        where: { user_id: testUsers[i % testUsers.length].user_id },
        limit: 10
      });
      queryPromises.push(queryPromise);
    }

    const results = await Promise.all(queryPromises);
    const endTime = Date.now();
    const totalTime = endTime - startTime;

    console.log(`${CONCURRENT_QUERIES}개 동시 쿼리 처리 시간: ${totalTime}ms`);
    console.log(`쿼리당 평균 시간: ${(totalTime / CONCURRENT_QUERIES).toFixed(2)}ms`);

    // 전체 처리 시간이 1초를 넘지 않아야 함
    expect(totalTime).toBeLessThan(1000);
    expect(results).toHaveLength(CONCURRENT_QUERIES);
  });

  test('메모리 사용량 모니터링 테스트', async () => {
    const initialMemory = process.memoryUsage();
    
    // 대량 데이터 조회
    const largeBatch = [];
    for (let i = 0; i < 5; i++) {
      const posts = await db.MyDayPost.findAll({
        limit: 200,
        offset: i * 200
      });
      largeBatch.push(...posts);
    }

    const afterQueryMemory = process.memoryUsage();
    
    // 메모리 정리를 위한 명시적 가비지 컬렉션 (테스트 환경에서만)
    if (global.gc) {
      global.gc();
    }
    
    const afterGcMemory = process.memoryUsage();

    const memoryIncrease = afterQueryMemory.heapUsed - initialMemory.heapUsed;
    const memoryAfterGc = afterGcMemory.heapUsed - initialMemory.heapUsed;

    console.log(`초기 메모리: ${(initialMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`);
    console.log(`쿼리 후 메모리: ${(afterQueryMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`);
    console.log(`GC 후 메모리: ${(afterGcMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`);
    console.log(`메모리 증가량: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);

    // 메모리 증가량이 100MB를 넘지 않아야 함
    expect(memoryIncrease / 1024 / 1024).toBeLessThan(100);
    expect(largeBatch.length).toBeGreaterThan(0);
  });

  test('데이터베이스 연결 풀 성능 테스트', async () => {
    const connectionPromises: Promise<any>[] = [];
    const startTime = Date.now();

    // 연결 풀 한계 테스트 (동시 연결 50개)
    for (let i = 0; i < 50; i++) {
      const connectionPromise = db.sequelize.query(
        'SELECT COUNT(*) as count FROM my_day_posts WHERE user_id = ?',
        {
          replacements: [testUsers[i % testUsers.length].user_id],
          type: QueryTypes.SELECT
        }
      );
      connectionPromises.push(connectionPromise);
    }

    const results = await Promise.allSettled(connectionPromises);
    const endTime = Date.now();
    const totalTime = endTime - startTime;

    const successfulQueries = results.filter(r => r.status === 'fulfilled').length;
    const failedQueries = results.filter(r => r.status === 'rejected').length;

    console.log(`연결 풀 테스트 - 총 시간: ${totalTime}ms`);
    console.log(`성공한 쿼리: ${successfulQueries}개`);
    console.log(`실패한 쿼리: ${failedQueries}개`);

    // 대부분의 쿼리가 성공해야 함
    expect(successfulQueries).toBeGreaterThanOrEqual(45);
    expect(totalTime).toBeLessThan(2000);
  });

  test('이미지 업로드 성능 테스트', async () => {
    // 가상의 이미지 데이터 생성 (Base64)
    const createMockImageData = (sizeKB: number) => {
      const size = sizeKB * 1024;
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < size; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return Buffer.from(result).toString('base64');
    };

    const imageSizes = [100, 500, 1000, 2000]; // KB 단위
    const uploadTimes: { [key: number]: number } = {};

    for (const size of imageSizes) {
      const imageData = createMockImageData(size);
      const startTime = Date.now();

      // 게시물과 함께 이미지 데이터 저장 시뮬레이션
      await db.MyDayPost.create({
        user_id: testUsers[0].user_id,
        content: `이미지 업로드 테스트 - ${size}KB`,
        emotion_summary: '행복',
        is_anonymous: false,
        like_count: 0,
        comment_count: 0,
        image_url: `data:image/jpeg;base64,${imageData.substring(0, 100)}...` // 일부만 저장
      });

      const endTime = Date.now();
      uploadTimes[size] = endTime - startTime;

      console.log(`${size}KB 이미지 업로드 시간: ${uploadTimes[size]}ms`);
    }

    // 각 크기별 업로드 시간 검증
    expect(uploadTimes[100]).toBeLessThan(200);   // 100KB: 200ms 이내
    expect(uploadTimes[500]).toBeLessThan(500);   // 500KB: 500ms 이내
    expect(uploadTimes[1000]).toBeLessThan(1000); // 1MB: 1초 이내
    expect(uploadTimes[2000]).toBeLessThan(2000); // 2MB: 2초 이내
  });

  test('검색 성능 테스트', async () => {
    const searchTerms = ['성능', '테스트', '게시물', '사용자', '행복'];
    const searchTimes: number[] = [];

    for (const term of searchTerms) {
      const startTime = Date.now();

      await db.MyDayPost.findAll({
        where: {
          [Op.or]: [
            {
              content: {
                [Op.like]: `%${term}%`
              }
            },
            {
              emotion_summary: {
                [Op.like]: `%${term}%`
              }
            }
          ]
        },
        limit: 50
      });

      const endTime = Date.now();
      const searchTime = endTime - startTime;
      searchTimes.push(searchTime);

      console.log(`"${term}" 검색 시간: ${searchTime}ms`);
    }

    const avgSearchTime = searchTimes.reduce((a, b) => a + b, 0) / searchTimes.length;
    const maxSearchTime = Math.max(...searchTimes);

    console.log(`평균 검색 시간: ${avgSearchTime.toFixed(2)}ms`);
    console.log(`최대 검색 시간: ${maxSearchTime}ms`);

    // 검색 성능 검증
    expect(avgSearchTime).toBeLessThan(300);
    expect(maxSearchTime).toBeLessThan(800);
  });
});