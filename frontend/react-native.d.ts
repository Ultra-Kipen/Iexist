// 프로젝트 루트에 react-native.d.ts 파일 수정
import 'react-native';

declare module 'react-native' {
  // 기존 내용 유지
  interface AccessibilityProps {
    accessibilityHint?: string;
  }
  
  interface ViewProps extends AccessibilityProps {}
  interface TextProps extends AccessibilityProps {}
  interface TouchableOpacityProps extends AccessibilityProps {}
  interface ButtonProps extends AccessibilityProps {}
  
  // StyleSheet 관련 타입 추가
  export const StyleSheet: {
    create: <T extends Record<string, any>>(styles: T) => T;
    flatten: (style: any) => any;
    absoluteFill: any;
    hairlineWidth: number;
  };
  
  // View 및 Text 스타일 타입 추가
  export type ViewStyle = any;
  export type TextStyle = any;
  export type ImageStyle = any;
  
  // ActivityIndicator 타입 추가
  export const ActivityIndicator: React.ComponentClass<{
    size?: 'small' | 'large' | number;
    color?: string;
    animating?: boolean;
    hidesWhenStopped?: boolean;
  } & ViewProps>;
}