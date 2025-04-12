// tests/integration/userBlock.test.ts
import { testRequest, createTestUser } from '../setup';
import db from '../../models';

describe('사용자 차단 기능 테스트', () => {
  let userOneToken: string;
  let userTwoToken: string;
  let userOneId: number;
  let userTwoId: number;

  beforeEach(async () => {
    // 첫 번째 사용자 생성
    const userOneData = await createTestUser();
    userOneToken = userOneData.token;
    userOneId = userOneData.userId;

    // 두 번째 사용자 생성
    const userTwoData = await createTestUser();
    userTwoToken = userTwoData.token;
    userTwoId = userTwoData.userId;
  });

  test('사용자가 다른 사용자를 차단할 수 있어야 함', async () => {
    const response = await testRequest
      .post('/api/users/block')
      .set('Authorization', `Bearer ${userOneToken}`)
      .send({ blocked_user_id: userTwoId });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body).toHaveProperty('message', '사용자를 차단했습니다.');

    // DB에서 차단 관계 확인
    const blockRecord = await db.UserBlock.findOne({
      where: {
        user_id: userOneId,
        blocked_user_id: userTwoId
      }
    });

    expect(blockRecord).not.toBeNull();
  });

  test('이미 차단한 사용자를 다시 차단하면 오류가 반환되어야 함', async () => {
    // 먼저 차단
    await testRequest
      .post('/api/users/block')
      .set('Authorization', `Bearer ${userOneToken}`)
      .send({ blocked_user_id: userTwoId });

    // 다시 차단 시도
    const response = await testRequest
      .post('/api/users/block')
      .set('Authorization', `Bearer ${userOneToken}`)
      .send({ blocked_user_id: userTwoId });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('status', 'error');
    expect(response.body).toHaveProperty('message', '이미 차단한 사용자입니다.');
  });

  test('사용자가 차단한 사용자를 차단 해제할 수 있어야 함', async () => {
    // 먼저 차단
    await testRequest
      .post('/api/users/block')
      .set('Authorization', `Bearer ${userOneToken}`)
      .send({ blocked_user_id: userTwoId });

    // 차단 해제
    const response = await testRequest
      .delete('/api/users/block')
      .set('Authorization', `Bearer ${userOneToken}`)
      .send({ blocked_user_id: userTwoId });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body).toHaveProperty('message', '사용자 차단을 해제했습니다.');

    // DB에서 차단 관계가 삭제되었는지 확인
    const blockRecord = await db.UserBlock.findOne({
      where: {
        user_id: userOneId,
        blocked_user_id: userTwoId
      }
    });

    expect(blockRecord).toBeNull();
  });

  test('차단하지 않은 사용자를 차단 해제하면 오류가 반환되어야 함', async () => {
    const response = await testRequest
      .delete('/api/users/block')
      .set('Authorization', `Bearer ${userOneToken}`)
      .send({ blocked_user_id: userTwoId });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('status', 'error');
    expect(response.body).toHaveProperty('message', '차단하지 않은 사용자입니다.');
  });

  test('인증되지 않은 사용자는 차단 기능을 사용할 수 없어야 함', async () => {
    const response = await testRequest
      .post('/api/users/block')
      .send({ blocked_user_id: userTwoId });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('status', 'error');
    expect(response.body).toHaveProperty('message', '인증이 필요합니다.');
  });

  test('존재하지 않는 사용자를 차단하려고 하면 오류가 반환되어야 함', async () => {
    const nonExistingUserId = 99999;
    
    const response = await testRequest
      .post('/api/users/block')
      .set('Authorization', `Bearer ${userOneToken}`)
      .send({ blocked_user_id: nonExistingUserId });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('status', 'error');
    expect(response.body).toHaveProperty('message', '차단할 사용자를 찾을 수 없습니다.');
  });
});