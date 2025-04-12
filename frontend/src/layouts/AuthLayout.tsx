// layouts/AuthLayout.tsx
// 인증(로그인/회원가입) 화면을 위한 레이아웃 컴포넌트

import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ImageBackground,
  Image,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import LoadingIndicator from '../components/LoadingIndicator';

interface AuthLayoutProps {
  children: React.ReactNode;
  loading?: boolean;
  title?: React.ReactNode;
  footer?: React.ReactNode;
  imageBackground?: boolean;
  logoVisible?: boolean;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  loading = false,
  title,
  footer,
  imageBackground = false,
  logoVisible = true,
}) => {
  const { theme } = useTheme();
  
  const renderContent = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardView}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollView}
          keyboardShouldPersistTaps="handled"
        >
          {/* 로고 */}
          {logoVisible && (
            <View style={styles.logoContainer}>
              <Image
                // 앱 로고 이미지 경로를 설정해주세요
                source={require('../assets/images/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          )}
          
          {/* 제목 */}
          {title && <View style={styles.titleContainer}>{title}</View>}
          
          {/* 메인 콘텐츠 */}
          <View style={styles.contentContainer}>
            {loading ? <LoadingIndicator /> : children}
          </View>
          
          {/* 푸터 */}
          {footer && <View style={styles.footerContainer}>{footer}</View>}
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
  
  // 배경 이미지 사용 여부에 따라 다른 레이아웃 반환
  if (imageBackground) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          backgroundColor="transparent"
          translucent
          barStyle="light-content"
        />
        <ImageBackground
          // 배경 이미지 경로를 설정해주세요
          source={require('../assets/images/auth-background.jpg')}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <View style={styles.overlay}>
            {renderContent()}
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar
        backgroundColor={theme.colors.background}
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
      />
      {renderContent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 30,
  },
  logo: {
    width: 150,
    height: 150,
  },
  titleContainer: {
    marginBottom: 30,
  },
  contentContainer: {
    flex: 1,
    width: '100%',
  },
  footerContainer: {
    width: '100%',
    marginTop: 20,
    alignItems: 'center',
  },
});

export default AuthLayout;