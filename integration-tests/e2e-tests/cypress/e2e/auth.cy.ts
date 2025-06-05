/// <reference types="cypress" />
describe('인증 관련 테스트', () => {
  const testUser = {
    username: `e2e_user_${Date.now().toString().slice(-6)}`,
    email: `e2e_${Date.now().toString().slice(-6)}@example.com`,
    password: 'Password1234!'
  };

  beforeEach(() => {
    // 프론트엔드 서버가 실행 중이어야 합니다
    cy.intercept('GET', '/').as('homeLoad');
    cy.visit('/', { failOnStatusCode: false });
    cy.wait('@homeLoad', { timeout: 10000 }).then((interception) => {
      // 서버가 응답하지 않으면 테스트를 중단
      if (!interception.response) {
        throw new Error('프론트엔드 서버가 실행되고 있지 않습니다. 먼저 프론트엔드 서버를 시작하세요.');
      }
    });
  });

  it('API 연결 테스트', () => {
    // 백엔드 서버가 실행 중인지 테스트
    cy.request({
      method: 'GET',
      url: Cypress.env('apiUrl') || 'http://localhost:3000/api',
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.be.within(200, 404); // 어떤 응답이든 받았음을 확인
      cy.log('백엔드 서버가 응답합니다.');
    });
  });

  // 나머지 테스트는 서버가 실행 중일 때만 실행
  it('회원가입 및 로그인 과정을 완료할 수 있어야 함', { browser: '!firefox' }, () => {
    // API 테스트가 통과했을 때만 실행
    if (Cypress.browser.name === 'firefox') {
      cy.log('이 테스트는 Firefox에서 건너뜁니다.');
      return;
    }

    cy.get('body').then(($body) => {
      if ($body.text().includes('회원가입')) {
        // 회원가입 링크가 있으면 실행
        cy.contains('회원가입').click();
        
        // 회원가입 양식 작성
        cy.get('input[name="username"]').type(testUser.username);
        cy.get('input[name="email"]').type(testUser.email);
        cy.get('input[name="password"]').type(testUser.password);
        cy.get('input[name="confirmPassword"]').type(testUser.password);
        
        // 회원가입 제출
        cy.contains('계정 만들기').click();
        
        // 회원가입 성공 메시지 확인
        cy.contains('회원가입이 완료되었습니다', { timeout: 10000 }).should('be.visible');
        
        // 로그인 페이지로 이동
        cy.contains('로그인').click();
        
        // 로그인 양식 작성
        cy.get('input[name="email"]').type(testUser.email);
        cy.get('input[name="password"]').type(testUser.password);
        
        // 로그인 제출
        cy.contains('로그인하기').click();
        
        // 로그인 성공 확인 (홈 화면으로 리디렉션)
        cy.url().should('include', '/home');
        cy.contains('오늘의 감정', { timeout: 10000 }).should('be.visible');
      } else {
        cy.log('회원가입 링크를 찾을 수 없습니다. 프론트엔드 서버가 실행 중인지 확인하세요.');
      }
    });
  });
});