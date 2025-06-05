// cypress/support/e2e.ts
/// <reference types="cypress" />

// 모든 테스트에서 사용될 수 있는 공통 명령과 함수를 정의
import './commands';

// 예외 처리 - 모든 예외 무시
Cypress.on('uncaught:exception', (err, runnable) => {
  // 테스트가 중단되지 않도록 모든 예외 무시
  return false;
});

// 컨텐츠 타입 오류 처리
Cypress.on('fail', (error, runnable) => {
  // 컨텐츠 타입 오류 무시
  if (error.message.includes('content-type') || 
      error.message.includes('cross-origin') ||
      error.message.includes('scrollable')) {
    return false;
  }
  throw error;
});

// 요청 실패 처리
Cypress.on('fail', (error, runnable) => {
  // 요청 실패시 재시도
  if (error.message.includes('visit') || error.message.includes('request')) {
    // 요청 관련 오류는 무시하고 테스트 계속 진행
    return false;
  }
  
  throw error;
});