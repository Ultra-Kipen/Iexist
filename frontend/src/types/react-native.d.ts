// src/types/react-native.d.ts - 추가할 내용
import 'react-native';

// React Native 타입 확장
declare module 'react-native' {
  // 기존 타입 유지
  export const Alert: {
    alert: (title: string, message?: string, buttons?: Array<{text: string, onPress?: () => void}>, options?: object) => void;
  };
  
  export const View: React.ComponentType<any>;
  export const Text: React.ComponentType<any>;
  export const TouchableOpacity: React.ComponentType<any>;
  export const Image: React.ComponentType<any>;
  export const ScrollView: React.ComponentType<any>;
  export const TextInput: React.ComponentType<any>;
  
  // Button 컴포넌트 타입 추가
  export const Button: React.ComponentType<{
    title: string;
    onPress: () => void;
    color?: string;
    disabled?: boolean;
  }>;

  // 추가할 타입 - AuthLayout에 필요한 컴포넌트들
  export const Platform: {
    OS: string;
    select: <T extends Record<string, any>>(config: T) => any;
    Version: number;
  };
  
  export const KeyboardAvoidingView: React.ComponentType<any>;
  export const TouchableWithoutFeedback: React.ComponentType<any>;
  export const Keyboard: {
    dismiss: () => void;
  };
  
  export const ImageBackground: React.ComponentType<any>;
  export const StatusBar: React.ComponentType<any> & {
    currentHeight?: number;
  };
  
  export const StyleSheet: {
    create: <T extends Record<string, any>>(styles: T) => T;
  };
  
  // ViewProps 확장
  export interface ViewProps {
    testID?: string;
    style?: any;
  }
}

// React Native Safe Area Context 타입 정의
declare module 'react-native-safe-area-context' {
  import React from 'react';
  
  export const SafeAreaView: React.ComponentType<{
    style?: any;
    testID?: string;
    children?: React.ReactNode;
  }>;
}

// React Test Instance 타입 확장
declare namespace jest {
  interface ReactTestInstance {
    textContent?: string;  // textContent 속성 추가
  }
}

// 바인딩 요소 타입 문제 해결
declare namespace React {
  interface FunctionComponent<P = {}> {
    (props: P & { children?: React.ReactNode, screenOptions?: any, name?: string }): React.ReactElement<any, any> | null;
  }
}