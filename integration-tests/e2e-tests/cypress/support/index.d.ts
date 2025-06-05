// cypress/support/index.d.ts
/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject = any> {
    /**
     * 사용자 등록 커스텀 명령어
     * @param username 사용자 이름
     * @param email 이메일
     * @param password 비밀번호
     * @example
     * cy.register('testUser', 'test@example.com', 'password123')
     */
    register(username: string, email: string, password: string): Chainable<void>;
    
    /**
     * 로그인 커스텀 명령어
     * @param email 이메일
     * @param password 비밀번호
     * @example
     * cy.login('test@example.com', 'password123')
     */
    login(email: string, password: string): Chainable<void>;
    
    /**
     * 로그아웃 커스텀 명령어
     * @example
     * cy.logout()
     */
    logout(): Chainable<void>;
    
    /**
     * 안전한 페이지 방문 커스텀 명령어
     * 실패 시 오류를 무시하고 계속 진행합니다
     * @param url 방문할 URL
     * @example
     * cy.safeVisit('/home')
     */
    safeVisit(url: string): Chainable<AUTWindow>;
  }
}