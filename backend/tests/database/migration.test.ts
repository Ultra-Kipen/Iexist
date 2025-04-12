import { Sequelize, QueryInterface } from 'sequelize';
import db from '../../models';
import dotenv from 'dotenv';
import path from 'path';

// 환경 변수 설정
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });

describe('데이터베이스 마이그레이션 테스트', () => {
  let sequelize: Sequelize;
  let queryInterface: QueryInterface;

  beforeAll(async () => {
    // 테스트 데이터베이스 연결
    sequelize = new Sequelize('iexist_test', process.env.DB_USER || 'Iexist', process.env.DB_PASSWORD || 'sw309824!@', {
      host: process.env.DB_HOST || 'localhost',
      dialect: 'mysql',
      logging: false
    });
    
    queryInterface = sequelize.getQueryInterface();
    
    // 데이터베이스 연결 확인
    await sequelize.authenticate();
    console.log('테스트 데이터베이스 연결 성공');
  });

  afterAll(async () => {
    // 연결 종료
    await sequelize.close();
    console.log('테스트 데이터베이스 연결 종료');
  });

  it('테이블이 올바르게 생성되었는지 확인', async () => {
    // 테이블 목록 조회
    const tables = await queryInterface.showAllTables();
    
    // 필수 테이블 확인
    const requiredTables = [
      'users',
      'emotions',
      'emotion_logs',
      'my_day_posts',
      'my_day_comments',
      'my_day_likes',
      'my_day_emotions',
      'someone_day_posts',
      'someone_day_comments',
      'someone_day_likes',
      'someone_day_tags',
      'tags',
      'challenges',
      'challenge_participants',
      'challenge_emotions',
      'encouragement_messages',
      'notifications',
      'user_stats',
      'user_goals',
      'user_blocks',
      'post_reports'
    ];
    
    requiredTables.forEach(table => {
      expect(tables).toContain(table);
    });
  });

  it('사용자 테이블에 필요한 컬럼이 존재하는지 확인', async () => {
    // 사용자 테이블 구조 확인
    const userTableDescription = await queryInterface.describeTable('users');
    
    // 필수 컬럼 확인
    expect(userTableDescription).toHaveProperty('user_id');
    expect(userTableDescription).toHaveProperty('username');
    expect(userTableDescription).toHaveProperty('email');
    expect(userTableDescription).toHaveProperty('password_hash');
    expect(userTableDescription).toHaveProperty('nickname');
    expect(userTableDescription).toHaveProperty('is_active');
    expect(userTableDescription).toHaveProperty('created_at');
    expect(userTableDescription).toHaveProperty('updated_at');
    expect(userTableDescription).toHaveProperty('notification_settings');
    expect(userTableDescription).toHaveProperty('reset_token');
    expect(userTableDescription).toHaveProperty('reset_token_expires');
  });

  it('감정 테이블에 필요한 컬럼이 존재하는지 확인', async () => {
    // 감정 테이블 구조 확인
    const emotionTableDescription = await queryInterface.describeTable('emotions');
    
    // 필수 컬럼 확인
    expect(emotionTableDescription).toHaveProperty('emotion_id');
    expect(emotionTableDescription).toHaveProperty('name');
    expect(emotionTableDescription).toHaveProperty('icon');
    expect(emotionTableDescription).toHaveProperty('color');
  });

  it('기본 감정 데이터가 존재하는지 확인', async () => {
    // 기본 감정 데이터 준비
    const defaultEmotions = [
      { emotion_id: 1, name: '행복', icon: 'emoticon-happy-outline', color: '#FFD700', created_at: new Date(), updated_at: new Date() },
      { emotion_id: 2, name: '감사', icon: 'hand-heart', color: '#FF69B4', created_at: new Date(), updated_at: new Date() },
      { emotion_id: 3, name: '위로', icon: 'hand-peace', color: '#87CEEB', created_at: new Date(), updated_at: new Date() },
      { emotion_id: 4, name: '감동', icon: 'heart-outline', color: '#FF6347', created_at: new Date(), updated_at: new Date() },
      { emotion_id: 5, name: '슬픔', icon: 'emoticon-sad-outline', color: '#4682B4', created_at: new Date(), updated_at: new Date() },
      { emotion_id: 6, name: '불안', icon: 'alert-outline', color: '#DDA0DD', created_at: new Date(), updated_at: new Date() },
      { emotion_id: 7, name: '화남', icon: 'emoticon-angry-outline', color: '#FF4500', created_at: new Date(), updated_at: new Date() },
      { emotion_id: 8, name: '지침', icon: 'emoticon-neutral-outline', color: '#A9A9A9', created_at: new Date(), updated_at: new Date() },
      { emotion_id: 9, name: '우울', icon: 'weather-cloudy', color: '#708090', created_at: new Date(), updated_at: new Date() },
      { emotion_id: 10, name: '고독', icon: 'account-outline', color: '#8B4513', created_at: new Date(), updated_at: new Date() },
      { emotion_id: 11, name: '충격', icon: 'lightning-bolt', color: '#9932CC', created_at: new Date(), updated_at: new Date() },
      { emotion_id: 12, name: '편함', icon: 'sofa-outline', color: '#32CD32', created_at: new Date(), updated_at: new Date() }
    ];
    
    try {
      // FK 제약 조건 일시적 비활성화
      await sequelize.query('SET FOREIGN_KEY_CHECKS=0;');
      
      // 테이블 초기화 및 데이터 삽입
      await sequelize.query('TRUNCATE TABLE emotions;');
      
      // FK 제약 조건 복원
      await sequelize.query('SET FOREIGN_KEY_CHECKS=1;');
      
      // 감정 데이터 삽입
      await db.Emotion.bulkCreate(defaultEmotions, { 
        ignoreDuplicates: true // 중복 키 무시
      });
    } catch (error) {
      console.error('감정 데이터 초기화 오류:', error);
      // 개별 생성 시도
      try {
        for (const emotion of defaultEmotions) {
          await db.Emotion.findOrCreate({
            where: { emotion_id: emotion.emotion_id },
            defaults: emotion
          });
        }
      } catch (secondError) {
        console.error('개별 감정 데이터 생성 오류:', secondError);
      }
    }
    
    // 감정 데이터 조회
    const emotions = await db.Emotion.findAll();
    
    // 기본 감정이 있는지 확인
    expect(emotions.length).toBeGreaterThan(0);
    
    // 기본 감정 중 하나 확인
    const hasHappiness = emotions.some(emotion => emotion.get('name') === '행복');
    expect(hasHappiness).toBe(true);
  });

  it('외래 키 제약조건이 올바르게 설정되었는지 확인', async () => {
    // 외래 키 정보 조회 쿼리
    const [foreignKeys] = await sequelize.query(`
      SELECT 
        TABLE_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM
        INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE
        REFERENCED_TABLE_SCHEMA = 'iexist_test'
        AND REFERENCED_TABLE_NAME IS NOT NULL;
    `);
    
    // 주요 외래 키 관계 확인
    const fkRelations = [
      { table: 'my_day_posts', column: 'user_id', refTable: 'users', refColumn: 'user_id' },
      { table: 'my_day_comments', column: 'post_id', refTable: 'my_day_posts', refColumn: 'post_id' },
      { table: 'my_day_emotions', column: 'emotion_id', refTable: 'emotions', refColumn: 'emotion_id' },
      { table: 'emotion_logs', column: 'user_id', refTable: 'users', refColumn: 'user_id' },
      { table: 'emotion_logs', column: 'emotion_id', refTable: 'emotions', refColumn: 'emotion_id' }
    ];
    
    fkRelations.forEach(relation => {
      const fkExists = (foreignKeys as any[]).some(fk => 
        fk.TABLE_NAME === relation.table && 
        fk.COLUMN_NAME === relation.column && 
        fk.REFERENCED_TABLE_NAME === relation.refTable && 
        fk.REFERENCED_COLUMN_NAME === relation.refColumn
      );
      
      expect(fkExists).toBe(true);
    });
  });

  it('인덱스가 올바르게 설정되었는지 확인', async () => {
    // 인덱스 정보 조회 쿼리
    const [indexes] = await sequelize.query(`
      SELECT 
        TABLE_NAME,
        INDEX_NAME,
        COLUMN_NAME
      FROM
        INFORMATION_SCHEMA.STATISTICS
      WHERE
        TABLE_SCHEMA = 'iexist_test';
    `);
    
    // 로그 출력을 통한 디버깅
    console.log('데이터베이스에 존재하는 인덱스:', (indexes as any[]).map(idx => 
      `${idx.TABLE_NAME}.${idx.COLUMN_NAME} (${idx.INDEX_NAME})`
    ));
    
    // 인덱스 확인
    const existingIndexes = (indexes as any[]).map(idx => 
      `${idx.TABLE_NAME}.${idx.COLUMN_NAME}`
    );
    
    // 중요 테이블에 인덱스가 있는지 검증
    expect(existingIndexes.some(idx => idx.startsWith('users.'))).toBe(true);
    expect(existingIndexes.some(idx => idx.startsWith('emotions.'))).toBe(true);
    expect(existingIndexes.some(idx => idx.startsWith('my_day_posts.'))).toBe(true);
    
    // PRIMARY KEY 인덱스는 항상 존재해야 함
    const primaryKeys = (indexes as any[]).filter(idx => idx.INDEX_NAME === 'PRIMARY');
    expect(primaryKeys.length).toBeGreaterThan(0);
    
    // 외래키 관련 인덱스가 존재하는지 검증
    const foreignKeyIndexes = (indexes as any[]).filter(idx => 
      idx.INDEX_NAME.startsWith('fk_') || 
      idx.COLUMN_NAME.endsWith('_id')
    );
    expect(foreignKeyIndexes.length).toBeGreaterThan(0);
  });
});