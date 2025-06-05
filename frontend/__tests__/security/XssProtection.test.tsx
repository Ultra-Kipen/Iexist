import React from 'react';
import { render } from '@testing-library/react-native';
import { Text, View } from 'react-native';

// XSS 방어를 위한 텍스트 처리 유틸리티
const sanitizeHtml = (html: string): string => {
  // 실제 앱에서는 더 강력한 라이브러리 사용 권장
  return html
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/javascript:/gi, '');
};

// HTML을 네이티브 텍스트로 렌더링하는 가상 함수
const renderHtmlAsText = (htmlContent: string): string => {
  // 먼저 태그를 제거하고 싶은 경우, 이스케이프 처리 전의 원본 텍스트로 작업
  // 이 예제에서는 이미 이스케이프된 HTML에서 원본 텍스트를 추출해야 함
  return htmlContent
    .replace(/<div>|<\/div>/g, '') // 외부 div 태그 제거
    .replace(/&lt;[^&]*&gt;/g, ''); // 이스케이프된 태그 제거
};

// 사용자 입력을 표시하는 컴포넌트
const UserContentDisplay = ({ content }: { content: string }) => {
  const sanitizedContent = sanitizeHtml(content);
  // 이스케이프된 HTML 콘텐츠를 포함한 문자열
  const htmlContentWithTags = `<div>${sanitizedContent}</div>`;
  // 이스케이프된 태그를 제거하고 텍스트만 추출
  const plainTextContent = renderHtmlAsText(htmlContentWithTags);
  
  return (
    <View>
      <Text testID="display-text">{sanitizedContent}</Text>
      <Text testID="html-content">HTML 콘텐츠: {htmlContentWithTags}</Text>
      <Text testID="text-only">순수 텍스트: {plainTextContent}</Text>
    </View>
  );
};

describe('XSS 방어 테스트', () => {
  test('XSS 공격 시도가 포함된 콘텐츠를 안전하게 처리해야 함', () => {
    const maliciousContent = '<script>alert("XSS")</script>';
    const { getByTestId } = render(<UserContentDisplay content={maliciousContent} />);
    
    const displayText = getByTestId('display-text');
    expect(displayText.props.children).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
  });

  test('JavaScript URL을 안전하게 처리해야 함', () => {
    const maliciousUrl = 'javascript:alert("XSS")';
    const { getByTestId } = render(<UserContentDisplay content={maliciousUrl} />);
    
    const displayText = getByTestId('display-text');
    expect(displayText.props.children).not.toContain('javascript:');
  });

  test('HTML 이스케이프 처리를 올바르게 수행해야 함', () => {
    const htmlContent = '<div class="user-content">User\'s "special" content</div>';
    const { getByTestId } = render(<UserContentDisplay content={htmlContent} />);
    
    const displayText = getByTestId('display-text');
    const sanitized = '&lt;div class=&quot;user-content&quot;&gt;User&#39;s &quot;special&quot; content&lt;/div&gt;';
    expect(displayText.props.children).toBe(sanitized);
  });
  
  test('HTML 태그가 렌더링되지 않고 문자열로 표시되어야 함', () => {
    const htmlContent = '<b>굵은 텍스트</b>';
    const { getByTestId } = render(<UserContentDisplay content={htmlContent} />);
    
    const htmlText = getByTestId('html-content');
    expect(htmlText.props.children).toEqual(['HTML 콘텐츠: ', `<div>&lt;b&gt;굵은 텍스트&lt;/b&gt;</div>`]);
    
    // 순수 텍스트 검증 - 이스케이프된 태그가 제거되고 원본 텍스트만 남아야 함
    const textOnly = getByTestId('text-only');
    expect(textOnly.props.children).toEqual(['순수 텍스트: ', '굵은 텍스트']);
  });
});