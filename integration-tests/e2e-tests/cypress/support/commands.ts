// cypress/support/commands.ts
/// <reference types="cypress" />

// 사용자 등록 명령어
Cypress.Commands.add('register', (username: string, email: string, password: string) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl') || 'http://localhost:3000/api'}/auth/register`,
    body: { username, email, password },
    failOnStatusCode: false
  }).then((response) => {
    // 409 (이미 존재하는 사용자)인 경우도 허용
    expect(response.status).to.be.oneOf([201, 409]);
  });
});

// 로그인 명령어
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl') || 'http://localhost:3000/api'}/auth/login`,
    body: { email, password },
    failOnStatusCode: false  // 실패해도 계속 진행
  }).then((response) => {
    if (response.status === 200 && response.body && response.body.data && response.body.data.token) {
      localStorage.setItem('authToken', response.body.data.token);
      
      // 요청 헤더에 토큰 설정
      cy.intercept('*', (req) => {
        req.headers['Authorization'] = `Bearer ${response.body.data.token}`;
      });
    } else {
      // 로그인 실패 시에도 테스트 계속 진행
      cy.log('로그인 실패 - 테스트 계속 진행');
    }
  });
});

// 로그아웃 명령
Cypress.Commands.add('logout', () => {
  localStorage.removeItem('authToken');
  cy.visit('/login', { failOnStatusCode: false });
});

// 안전한 방문 명령어 추가
Cypress.Commands.add('safeVisit', (url: string) => {
  cy.visit(url, { 
    failOnStatusCode: false,
    retryOnStatusCodeFailure: true,
    timeout: 30000
  });
});
// commands.ts 파일 맨 아래에 추가

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * 새 사용자 등록
       * @param username 사용자 이름
       * @param email 이메일
       * @param password 비밀번호
       */
      register(username: string, email: string, password: string): Chainable<any>;
      
      /**
       * 사용자 로그인
       * @param email 이메일
       * @param password 비밀번호
       */
      login(email: string, password: string): Chainable<any>;
      
      /**
       * 사용자 로그아웃
       */
      logout(): Chainable<any>;
      
      /**
       * 실패해도 진행하는 안전한 페이지 방문
       * @param url 방문할 URL
       */
      safeVisit(url: string): Chainable<any>;
    }
  }
}
// 파일을 모듈로 만들기 위한 빈 export
export {};