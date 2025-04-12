// constants/theme.ts
// 애플리케이션 테마 관련 상수 정의

// 색상 팔레트
export const COLORS = {
    // 기본 색상
    PRIMARY: '#4A6FFF', // 주 색상
    SECONDARY: '#8C9EFF', // 보조 색상
    ACCENT: '#FF6D00', // 강조 색상
    
    // 기능적 색상
    SUCCESS: '#4CAF50', // 성공
    ERROR: '#F44336', // 오류
    WARNING: '#FFC107', // 경고
    INFO: '#2196F3', // 정보
    
    // 중립 색상
    WHITE: '#FFFFFF',
    BLACK: '#000000',
    GREY_100: '#F5F5F5',
    GREY_200: '#EEEEEE',
    GREY_300: '#E0E0E0',
    GREY_400: '#BDBDBD',
    GREY_500: '#9E9E9E',
    GREY_600: '#757575',
    GREY_700: '#616161',
    GREY_800: '#424242',
    GREY_900: '#212121',
    
    // 배경 색상
    BACKGROUND_LIGHT: '#FFFFFF',
    BACKGROUND_DARK: '#121212',
    
    // 텍스트 색상
    TEXT_PRIMARY_LIGHT: '#212121',
    TEXT_SECONDARY_LIGHT: '#757575',
    TEXT_PRIMARY_DARK: '#FFFFFF',
    TEXT_SECONDARY_DARK: '#AAAAAA',
    
    // 테두리 색상
    BORDER_LIGHT: '#E0E0E0',
    BORDER_DARK: '#333333',
    
    // 특수 색상
    TRANSPARENT: 'transparent',
    OVERLAY: 'rgba(0, 0, 0, 0.5)',
    
    // 감정 색상
    EMOTION: {
      HAPPY: '#FFD700', // 행복
      GRATEFUL: '#FF69B4', // 감사
      COMFORTING: '#87CEEB', // 위로
      TOUCHED: '#FF6347', // 감동
      SAD: '#4682B4', // 슬픔
      ANXIOUS: '#DDA0DD', // 불안
      ANGRY: '#FF4500', // 화남
      TIRED: '#A9A9A9', // 지침
      DEPRESSED: '#708090', // 우울
      LONELY: '#8B4513', // 고독
      SHOCKED: '#9932CC', // 충격
      COMFORTABLE: '#32CD32', // 편함
    },
  };
  
  // 폰트 크기
  export const FONT_SIZE = {
    XS: 10,
    SMALL: 12,
    MEDIUM: 14,
    LARGE: 16,
    XL: 18,
    XXL: 20,
    HEADING1: 24,
    HEADING2: 22,
    HEADING3: 20,
    HEADING4: 18,
  };
  
  // 폰트 두께
  export const FONT_WEIGHT = {
    LIGHT: '300',
    REGULAR: '400',
    MEDIUM: '500',
    SEMIBOLD: '600',
    BOLD: '700',
  };
  
  // 간격
  export const SPACING = {
    XS: 4,
    SMALL: 8,
    MEDIUM: 16,
    LARGE: 24,
    XL: 32,
    XXL: 40,
  };
  
  // 그림자
  export const SHADOWS = {
    LIGHT: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
    },
    MEDIUM: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
      elevation: 4,
    },
    DARK: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
  };
  
  // 테마 타입
  export type ThemeType = 'light' | 'dark' | 'system';
  
  // 라이트 테마
  export const LIGHT_THEME = {
    colors: {
      primary: COLORS.PRIMARY,
      secondary: COLORS.SECONDARY,
      accent: COLORS.ACCENT,
      background: COLORS.BACKGROUND_LIGHT,
      card: COLORS.WHITE,
      text: COLORS.TEXT_PRIMARY_LIGHT,
      textSecondary: COLORS.TEXT_SECONDARY_LIGHT,
      border: COLORS.BORDER_LIGHT,
      notification: COLORS.PRIMARY,
      error: COLORS.ERROR,
      success: COLORS.SUCCESS,
      warning: COLORS.WARNING,
      info: COLORS.INFO,
    },
    dark: false,
    shadows: SHADOWS,
  };
  
  // 다크 테마
  export const DARK_THEME = {
    colors: {
      primary: COLORS.PRIMARY,
      secondary: COLORS.SECONDARY,
      accent: COLORS.ACCENT,
      background: COLORS.BACKGROUND_DARK,
      card: COLORS.GREY_900,
      text: COLORS.TEXT_PRIMARY_DARK,
      textSecondary: COLORS.TEXT_SECONDARY_DARK,
      border: COLORS.BORDER_DARK,
      notification: COLORS.PRIMARY,
      error: COLORS.ERROR,
      success: COLORS.SUCCESS,
      warning: COLORS.WARNING,
      info: COLORS.INFO,
    },
    dark: true,
    shadows: SHADOWS,
  };
  
  // 테마 종류
  export const THEMES = {
    light: LIGHT_THEME,
    dark: DARK_THEME,
  };
  
  // 반응형 디자인을 위한 브레이크포인트
  export const BREAKPOINTS = {
    SMALL: 576,
    MEDIUM: 768,
    LARGE: 992,
    XLARGE: 1200,
  };
  
  // 테마 설정 옵션
  export const THEME_OPTIONS = [
    { label: '라이트 모드', value: 'light' },
    { label: '다크 모드', value: 'dark' },
    { label: '시스템 설정', value: 'system' },
  ];
  
  // 기본 테마
  export const DEFAULT_THEME: ThemeType = 'system';