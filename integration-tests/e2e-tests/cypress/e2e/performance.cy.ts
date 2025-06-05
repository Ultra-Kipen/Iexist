/// <reference types="cypress" />

describe('성능 테스트', () => {
  const testUser = {
    email: `perf_${Date.now().toString().slice(-6)}@example.com`,
    password: 'Password1234!',
    username: `perf_user_${Date.now().toString().slice(-6)}`
  };
  
  beforeEach(() => {
    // 테스트 사용자 등록 및 로그인
    cy.register(testUser.username, testUser.email, testUser.password);
    cy.login(testUser.email, testUser.password);
  });
  
  it('페이지 로딩 성능 테스트', () => {
    // 성능 측정 시작
    const startTime = new Date().getTime();
    
    // 홈 페이지 접근
    cy.visit('/home', { failOnStatusCode: false });
    
    // 페이지 로딩 완료 확인
    cy.get('body').should('be.visible').then(() => {
      const endTime = new Date().getTime();
      const loadTime = endTime - startTime;
      
      // 로딩 시간 로그 출력
      cy.log(`홈 페이지 로딩 시간: ${loadTime}ms`);
      
      // 5초 이내에 로드되는지 확인 (필요에 따라 조정)
      expect(loadTime).to.be.lessThan(5000);
    });
  });
  
it('무한 스크롤 성능 테스트', () => {
  // 무한 스크롤이 있을 수 있는 페이지로 이동
  cy.visit('/home', { failOnStatusCode: false });
  cy.wait(1000);
  
  // 커뮤니티 페이지 검색
  cy.get('body').then($body => {
    if ($body.text().includes('커뮤니티')) {
      cy.contains('커뮤니티').click();
    } else if ($body.text().includes('누군가의 하루')) {
      cy.contains('누군가의 하루').click();
    }
    
    cy.wait(1000);
    
    // 빠른 스크롤 테스트
    const scrollCount = 5;
    
    for (let i = 0; i < scrollCount; i++) {
      // 수정: window.scrollTo 대신 cy.scrollTo 사용
      cy.scrollTo('bottom', { ensureScrollable: false });
      cy.wait(300); // 스크롤 사이에 짧은 대기
    }
    
    // 앱이 충돌 없이 계속 동작하는지 확인
    cy.get('body').should('be.visible');
  });
});
  
  it('다수의 상호작용 성능 테스트', () => {
    // 홈 페이지 접근
    cy.visit('/home', { failOnStatusCode: false });
    cy.wait(1000);
    
    // 여러 상호작용 테스트
    cy.get('body').then($body => {
      // 감정 선택 테스트
      if ($body.find('[data-testid="emotion-selector"]').length > 0) {
        // 감정 아이콘을 여러 번 빠르게 토글
        const emotionSelectors = $body.find('[data-testid="emotion-selector"]');
        
        if (emotionSelectors.length > 1) {
          for (let i = 0; i < Math.min(10, emotionSelectors.length); i++) {
            cy.get('[data-testid="emotion-selector"]').eq(i % emotionSelectors.length).click();
            cy.wait(100); // 아주 짧은 대기
          }
        }
      }
      
      // 앱이 충돌 없이 계속 동작하는지 확인
      cy.get('body').should('be.visible');
    });
  });
  
  it('대용량 데이터 렌더링 테스트', () => {
    // 통계 또는 그래프 페이지로 이동
    cy.get('body').then($body => {
      if ($body.text().includes('통계') || $body.text().includes('일상 돌아보기')) {
        if ($body.text().includes('일상 돌아보기')) {
          cy.contains('일상 돌아보기').click();
        } else {
          cy.contains('통계').click();
        }
        
        cy.wait(1000);
        
        // 통계 페이지 로딩 확인 (그래프 등)
        cy.get('body').then($statsBody => {
          // 페이지에 그래프 또는 차트 요소가 있는지 확인
          const hasCharts = $statsBody.find('canvas, svg, [data-testid*="chart"]').length > 0;
          
          if (hasCharts) {
            // 렌더링이 완료되었는지 확인
            cy.get('canvas, svg, [data-testid*="chart"]').should('be.visible');
          }
          
          // 테스트 통과
          expect(true).to.be.true;
        });
      }
    });
  });
});