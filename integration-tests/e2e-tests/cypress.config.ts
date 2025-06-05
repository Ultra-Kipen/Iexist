// cypress.config.ts 수정
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8081',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    video: false,
    screenshotOnRunFailure: true,
    viewportWidth: 1280,
    viewportHeight: 720,
    retries: {
      runMode: 1,
      openMode: 0
    },
    // 추가: 컨텐츠 타입 오류 해결을 위한 설정
    chromeWebSecurity: false,
    // 추가: 응답 처리 설정
    experimentalModifyObstructiveThirdPartyCode: true
  },
  env: {
    apiUrl: 'http://localhost:3000/api',
    waitForAnimations: true,
    animationDistanceThreshold: 20
  }
});