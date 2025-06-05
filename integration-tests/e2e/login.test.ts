import { device, element, by, expect } from 'detox';

describe('로그인 화면', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('로그인 폼에 입력 후 로그인 버튼 클릭', async () => {
    // 이메일 입력
    await element(by.id('email-input')).typeText('test@example.com');
    
    // 비밀번호 입력
    await element(by.id('password-input')).typeText('Test123!');
    
    // 키보드 닫기
    await element(by.id('password-input')).tapReturnKey();
    
    // 로그인 버튼 클릭
    await element(by.id('login-button')).tap();
    
    // 로그인 성공 여부 확인 (홈 화면 요소 확인)
    await expect(element(by.id('home-screen'))).toBeVisible();
  });
});