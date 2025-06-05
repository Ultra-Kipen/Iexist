import React from 'react';
import { render } from '@testing-library/react-native';
import { Text, View, Button } from 'react-native';

// 타입 정의 추가
interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

interface I18n {
  currentLocale: string;
  translations: Translations;
  t(key: string): string;
  setLocale(locale: string): void;
}

// 간단한 i18n 모듈 타입 정의와 함께 모킹
const i18n: I18n = {
  currentLocale: 'ko',
  translations: {
    ko: {
      greeting: '안녕하세요',
      welcome: '환영합니다',
      submit: '제출',
      cancel: '취소',
      date_format: 'YYYY년 MM월 DD일',
    },
    en: {
      greeting: 'Hello',
      welcome: 'Welcome',
      submit: 'Submit',
      cancel: 'Cancel',
      date_format: 'MM/DD/YYYY',
    },
  },
  t: function(key: string): string {
    // 타입 체크 추가
    const locale = this.currentLocale;
    const translations = this.translations[locale] || {};
    return translations[key] || key;
  },
  setLocale: function(locale: string): void {
    if (this.translations[locale]) {
      this.currentLocale = locale;
    }
  },
};

// 다국어 지원 컴포넌트
const LocalizedComponent = () => {
  return (
    <View>
      <Text testID="greeting">{i18n.t('greeting')}</Text>
      <Text testID="welcome">{i18n.t('welcome')}</Text>
      <Button title={i18n.t('submit')} onPress={() => {}} testID="submit-button" />
      <Button title={i18n.t('cancel')} onPress={() => {}} testID="cancel-button" />
    </View>
  );
};

// 날짜 형식 컴포넌트
const DateFormatComponent = ({ date }: { date: Date }) => {
  const formatDate = (date: Date, format: string): string => {
    // 실제 애플리케이션에서는 날짜 포맷팅 라이브러리 사용
    // 여기서는 간단한 예시만 구현
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    if (format === 'YYYY년 MM월 DD일') {
      return `${year}년 ${month}월 ${day}일`;
    } else {
      return `${month}/${day}/${year}`;
    }
  };

  return (
    <Text testID="formatted-date">
      {formatDate(date, i18n.t('date_format'))}
    </Text>
  );
};

describe('로컬라이제이션 테스트', () => {
  test('기본 언어(한국어)로 텍스트가 표시되어야 함', () => {
    i18n.setLocale('ko');
    const { getByTestId } = render(<LocalizedComponent />);
    
    expect(getByTestId('greeting').props.children).toBe('안녕하세요');
    expect(getByTestId('welcome').props.children).toBe('환영합니다');
    expect(getByTestId('submit-button').props.title).toBe('제출');
    expect(getByTestId('cancel-button').props.title).toBe('취소');
  });

  test('영어로 언어 변경 시 텍스트가 영어로 표시되어야 함', () => {
    i18n.setLocale('en');
    const { getByTestId } = render(<LocalizedComponent />);
    
    expect(getByTestId('greeting').props.children).toBe('Hello');
    expect(getByTestId('welcome').props.children).toBe('Welcome');
    expect(getByTestId('submit-button').props.title).toBe('Submit');
    expect(getByTestId('cancel-button').props.title).toBe('Cancel');
  });

  test('날짜 형식이 현재 언어에 맞게 표시되어야 함', () => {
    const testDate = new Date(2023, 0, 15); // 2023년 1월 15일
    
    // 한국어 날짜 형식 테스트
    i18n.setLocale('ko');
    let { getByTestId, rerender } = render(<DateFormatComponent date={testDate} />);
    expect(getByTestId('formatted-date').props.children).toBe('2023년 01월 15일');
    
    // 영어 날짜 형식 테스트
    i18n.setLocale('en');
    rerender(<DateFormatComponent date={testDate} />);
    expect(getByTestId('formatted-date').props.children).toBe('01/15/2023');
  });
});