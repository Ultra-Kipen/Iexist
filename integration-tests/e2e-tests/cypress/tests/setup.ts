// cypress/tests/setup.ts
before(() => {
  // 백엔드 서버가 실행 중인지 확인
  cy.request({
    method: 'GET',
    url: Cypress.env('apiUrl') || 'http://localhost:3000/api',
    failOnStatusCode: false,
    timeout: 10000
  }).then((response) => {
    if (response.status >= 200 && response.status < 500) {
      cy.log('백엔드 서버가 정상적으로 응답합니다.');
    } else {
      cy.log('백엔드 서버 응답 실패. 테스트를 계속 진행합니다.');
    }
  }).catch(() => {
    cy.log('백엔드 서버에 연결할 수 없습니다. 테스트를 계속 진행합니다.');
  });
});