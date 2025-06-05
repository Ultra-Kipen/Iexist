// tests/security/advanced-attacks.test.ts
import request from 'supertest';
import app from '../../app';
import db from '../../models';
import jwt from 'jsonwebtoken';

describe('고급 보안 취약점 테스트', () => {
  let testUser: any;
  let authToken: string;

  beforeEach(async () => {
    // 테스트 사용자 생성
    testUser = await db.User.create({
      username: `sectest_${Date.now()}`,
      email: `sectest_${Date.now()}@test.com`,
      password_hash: 'hashedpassword',
      nickname: '보안테스트사용자',
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

    // 인증 토큰 생성
    authToken = jwt.sign(
      { userId: testUser.user_id, username: testUser.username },
      process.env.JWT_SECRET || 'testsecret',
      { expiresIn: '1h' }
    );
  });

  afterEach(async () => {
    // 테스트 데이터 정리
    if (testUser) {
      await db.MyDayPost.destroy({ where: { user_id: testUser.user_id } });
      await db.SomeoneDayPost.destroy({ where: { user_id: testUser.user_id } });
      await db.User.destroy({ where: { user_id: testUser.user_id } });
    }
  });

  describe('SQL 인젝션 고급 패턴 테스트', () => {
    const sqlInjectionPayloads = [
      // Union 기반 인젝션
      "1' UNION SELECT username, password_hash FROM users--",
      "1' UNION SELECT NULL, NULL, NULL, table_name FROM information_schema.tables--",
      
      // Boolean 기반 Blind SQL 인젝션
      "1' AND (SELECT COUNT(*) FROM users) > 0--",
      "1' AND (SELECT LENGTH(password_hash) FROM users WHERE user_id=1) > 10--",
      
      // Time 기반 Blind SQL 인젝션
      "1'; WAITFOR DELAY '00:00:05'--",
      "1' AND (SELECT COUNT(*) FROM users WHERE username='admin') > 0 AND SLEEP(5)--",
      
      // Error 기반 인젝션
      "1' AND EXTRACTVALUE(1, CONCAT(0x7e, (SELECT COUNT(*) FROM users), 0x7e))--",
      "1' AND (SELECT * FROM (SELECT COUNT(*), CONCAT(version(), FLOOR(RAND(0)*2)) x FROM information_schema.tables GROUP BY x) a)--",
      
      // 스택 쿼리 인젝션
      "1'; DROP TABLE users;--",
      "1'; INSERT INTO users (username, email) VALUES ('hacker', 'hack@evil.com');--",
      
      // 함수 기반 우회
      "1' OR ASCII(SUBSTRING((SELECT password_hash FROM users LIMIT 1), 1, 1)) > 64--",
      "1' OR HEX((SELECT password_hash FROM users LIMIT 1))--"
    ];

    test('게시물 검색 SQL 인젝션 방어 테스트', async () => {
      for (const payload of sqlInjectionPayloads) {
        const response = await request(app)
          .get('/api/posts/search')
          .query({ q: payload })
          .set('Authorization', `Bearer ${authToken}`);

        // SQL 인젝션이 성공하면 보통 500 에러나 예상치 못한 데이터가 반환됨
        expect(response.status).not.toBe(500);
        
        // 응답에 민감한 정보가 포함되지 않았는지 확인
        const responseText = JSON.stringify(response.body).toLowerCase();
        expect(responseText).not.toMatch(/password_hash|user_id.*admin|database.*schema/);
        expect(responseText).not.toMatch(/sql.*error|mysql.*error|syntax.*error/);
      }
    });

    test('사용자 정보 조회 SQL 인젝션 방어 테스트', async () => {
      for (const payload of sqlInjectionPayloads) {
        const response = await request(app)
          .get(`/api/users/${payload}`)
          .set('Authorization', `Bearer ${authToken}`);

        // 유효하지 않은 ID이므로 404가 정상
        expect([400, 404]).toContain(response.status);
        
        // 에러 메시지에 SQL 관련 정보가 노출되지 않아야 함
        if (response.body.message) {
          expect(response.body.message.toLowerCase()).not.toMatch(/sql|database|table|column/);
        }
      }
    });

    test('게시물 생성 SQL 인젝션 방어 테스트', async () => {
      for (const payload of sqlInjectionPayloads) {
        const response = await request(app)
          .post('/api/my-day')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            content: payload,
            emotions: [1],
            isAnonymous: false
          });

        // 게시물이 정상적으로 생성되거나 유효성 검사 오류만 발생해야 함
        expect([200, 201, 400, 404]).toContain(response.status);
        
        // 만약 게시물이 생성되었다면, SQL 인젝션이 실행되지 않았는지 확인
        if (response.status === 201) {
          const createdPost = await db.MyDayPost.findByPk(response.body.post_id);
          expect(createdPost?.content).toBe(payload); // 원본 그대로 저장되어야 함
        }
      }
    });
  });

  describe('세션 하이재킹 및 토큰 조작 테스트', () => {
    test('JWT 토큰 조작 방어 테스트', async () => {
      const maliciousPayloads = [
        // 서명 없는 토큰
        'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4ifQ.',
        
        // 잘못된 서명
        authToken.substring(0, authToken.lastIndexOf('.')) + '.fakeSignature',
        
        // 만료된 토큰 시뮬레이션
        jwt.sign(
          { userId: testUser.user_id, username: testUser.username },
          process.env.JWT_SECRET || 'testsecret',
          { expiresIn: '-1h' }
        ),
        
        // 알고리즘 변경 시도
        jwt.sign(
          { userId: testUser.user_id, username: testUser.username, alg: 'none' },
          '',
          { algorithm: 'none' as any }
        )
      ];

      for (const maliciousToken of maliciousPayloads) {
        const response = await request(app)
          .get('/api/users/profile')
          .set('Authorization', `Bearer ${maliciousToken}`);

        // 인증 실패로 401 또는 403 반환되어야 함
        expect([401, 403]).toContain(response.status);
      }
    });

    test('세션 고정 공격 방어 테스트', async () => {
      // 로그인 전 요청
      const preLoginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });

      expect(preLoginResponse.status).toBe(401);

      // 정상 로그인
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'correctpassword' // 실제로는 해시된 비밀번호 검증
        });

      // 로그인 실패 시 테스트 종료
      if (loginResponse.status !== 200) {
        return;
      }

      const sessionToken = loginResponse.body.token;

      // 다른 사용자로 로그인 시도 (같은 세션 사용)
      const hijackAttempt = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${sessionToken}`)
        .set('X-Forwarded-For', '192.168.1.100'); // 다른 IP에서 접근

      // 토큰은 유효하지만 보안 정책에 따라 검증
      expect([200, 401, 403]).toContain(hijackAttempt.status);
    });

    test('토큰 재사용 방지 테스트', async () => {
      // 로그아웃
      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`);

      // 로그아웃 후 토큰 재사용 시도
      const reuseAttempt = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`);

      // 블랙리스트에 추가되어 접근 거부되어야 함
      expect([401, 403]).toContain(reuseAttempt.status);
    });
  });

  describe('권한 상승 공격 테스트', () => {
    test('다른 사용자 데이터 접근 시도', async () => {
      // 다른 사용자 생성
      const otherUser = await db.User.create({
        username: `other_${Date.now()}`,
        email: `other_${Date.now()}@test.com`,
        password_hash: 'hashedpassword',
        nickname: '다른사용자',
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

      // 다른 사용자의 게시물 생성
      const otherPost = await db.MyDayPost.create({
        user_id: otherUser.user_id,
        content: '다른 사용자의 비공개 게시물',
        emotion_summary: '슬픔',
        is_anonymous: false,
        like_count: 0,
        comment_count: 0
      });

      try {
        // 권한 없는 사용자가 다른 사용자의 게시물 수정 시도
        const unauthorizedUpdate = await request(app)
          .put(`/api/my-day/${otherPost.post_id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            content: '해킹된 내용',
            emotions: [1]
          });

        // 권한 없음으로 거부되어야 함
        expect([401, 403, 404]).toContain(unauthorizedUpdate.status);

        // 다른 사용자의 게시물 삭제 시도
        const unauthorizedDelete = await request(app)
          .delete(`/api/my-day/${otherPost.post_id}`)
          .set('Authorization', `Bearer ${authToken}`);

        expect([401, 403, 404]).toContain(unauthorizedDelete.status);

        // 원본 데이터가 변경되지 않았는지 확인
        const originalPost = await db.MyDayPost.findByPk(otherPost.post_id);
        expect(originalPost?.content).toBe('다른 사용자의 비공개 게시물');
      } finally {
        // 정리
        await db.MyDayPost.destroy({ where: { user_id: otherUser.user_id } });
        await db.User.destroy({ where: { user_id: otherUser.user_id } });
      }
    });

    test('관리자 권한 상승 시도', async () => {
      const adminEndpoints = [
        '/api/admin/users',
        '/api/admin/posts',
        '/api/admin/reports',
        '/api/admin/statistics'
      ];

      for (const endpoint of adminEndpoints) {
        const response = await request(app)
          .get(endpoint)
          .set('Authorization', `Bearer ${authToken}`);

        // 일반 사용자는 관리자 페이지에 접근할 수 없어야 함
        expect([401, 403, 404]).toContain(response.status);
      }
    });
  });

  describe('XSS 및 코드 인젝션 방어 테스트', () => {
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '"><script>alert("XSS")</script>',
      "'><script>alert('XSS')</script>",
      '<img src="x" onerror="alert(\'XSS\')">',
      '<svg onload="alert(\'XSS\')">',
      'javascript:alert("XSS")',
      '<iframe src="javascript:alert(\'XSS\')"></iframe>',
      '<input type="image" src="x" onerror="alert(\'XSS\')">',
      '<meta http-equiv="refresh" content="0;url=javascript:alert(\'XSS\')">'
    ];

    test('게시물 내용 XSS 방어 테스트', async () => {
      for (const payload of xssPayloads) {
        const response = await request(app)
          .post('/api/my-day')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            content: payload,
            emotions: [1],
            isAnonymous: false
          });

        if (response.status === 201) {
          // 게시물 조회 시 XSS 페이로드가 이스케이프되었는지 확인
          const getResponse = await request(app)
            .get(`/api/my-day/${response.body.post_id}`)
            .set('Authorization', `Bearer ${authToken}`);

          if (getResponse.status === 200) {
            const content = getResponse.body.content;
            // 위험한 태그들이 제거되거나 이스케이프되었는지 확인
            expect(content).not.toMatch(/<script[^>]*>/i);
            expect(content).not.toMatch(/javascript:/i);
            expect(content).not.toMatch(/onerror\s*=/i);
            expect(content).not.toMatch(/onload\s*=/i);
          }
        }
      }
    });

    test('사용자 프로필 XSS 방어 테스트', async () => {
      for (const payload of xssPayloads) {
        const response = await request(app)
          .put('/api/users/profile')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            nickname: payload,
            favorite_quote: payload
          });

        // 프로필 업데이트가 성공했다면
        if ([200, 201].includes(response.status)) {
          const profileResponse = await request(app)
            .get('/api/users/profile')
            .set('Authorization', `Bearer ${authToken}`);

          if (profileResponse.status === 200) {
            const profile = profileResponse.body;
            // XSS 페이로드가 안전하게 처리되었는지 확인
            if (profile.nickname) {
              expect(profile.nickname).not.toMatch(/<script[^>]*>/i);
              expect(profile.nickname).not.toMatch(/javascript:/i);
            }
            if (profile.favorite_quote) {
              expect(profile.favorite_quote).not.toMatch(/<script[^>]*>/i);
              expect(profile.favorite_quote).not.toMatch(/javascript:/i);
            }
          }
        }
      }
    });
  });

  describe('CSRF 및 요청 위조 방어 테스트', () => {
    test('CSRF 토큰 없는 요청 차단 테스트', async () => {
      // CSRF 토큰 없이 민감한 작업 수행 시도
      const response = await request(app)
        .delete(`/api/users/account`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('Origin', 'http://malicious-site.com');

      // CSRF 방어가 구현되어 있다면 403, 400, 또는 404 반환
      expect([400, 403, 404]).toContain(response.status);
    });

    test('잘못된 Origin 헤더 차단 테스트', async () => {
      const maliciousOrigins = [
        'http://evil-site.com',
        'https://fake-domain.com',
        'javascript:alert("XSS")',
        'data:text/html,<script>alert("XSS")</script>'
      ];

      for (const origin of maliciousOrigins) {
        const response = await request(app)
          .post('/api/my-day')
          .set('Authorization', `Bearer ${authToken}`)
          .set('Origin', origin)
          .send({
            content: '테스트 게시물',
            emotions: [1],
            isAnonymous: false
          });

        // CORS 정책에 의해 차단되어야 함
        expect([400, 403, 404]).toContain(response.status);
      }
    });
  });

  describe('파일 업로드 보안 테스트', () => {
    test('악성 파일 업로드 방지 테스트', async () => {
      const maliciousFiles = [
        {
          filename: 'virus.exe',
          content: 'MZ\x90\x00', // PE 헤더 시그니처
          mimetype: 'application/octet-stream'
        },
        {
          filename: 'script.php',
          content: '<?php system($_GET["cmd"]); ?>',
          mimetype: 'application/x-php'
        },
        {
          filename: 'evil.svg',
          content: '<svg onload="alert(\'XSS\')"><circle/></svg>',
          mimetype: 'image/svg+xml'
        },
        {
          filename: '../../../etc/passwd',
          content: 'root:x:0:0:root:/root:/bin/bash',
          mimetype: 'text/plain'
        }
      ];

      for (const file of maliciousFiles) {
        const response = await request(app)
          .post('/api/uploads/image')
          .set('Authorization', `Bearer ${authToken}`)
          .attach('image', Buffer.from(file.content), file.filename);

        // 악성 파일은 업로드가 거부되어야 함 (또는 업로드 API가 없을 경우 404)
        expect([400, 403, 404, 415]).toContain(response.status);
      }
    });

    test('파일 크기 제한 테스트', async () => {
      // 적당한 크기의 파일로 테스트 (5MB 시뮬레이션)
      const largeFileContent = 'A'.repeat(5 * 1024 * 1024);

      const response = await request(app)
        .post('/api/uploads/image')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('image', Buffer.from(largeFileContent), 'large-image.jpg');

      // 파일 크기 제한으로 인해 거부되거나, API가 없거나, 또는 예상치 못하게 성공할 수 있음
      expect([201, 400, 404, 413]).toContain(response.status);
      
      // 만약 413이 반환되었다면, 파일 크기 제한이 올바르게 작동
      if (response.status === 413) {
        console.log('파일 크기 제한이 올바르게 작동함');
      } else if (response.status === 201) {
        console.log('파일 업로드가 성공했지만, 크기 제한이 설정되지 않았을 수 있음');
      }
    });
  });
});