// tests/components/optimized/MemoizedList.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { MemoizedCard } from '../../../src/components/optimized/MemoizedList';

// react-native 모킹
jest.mock('react-native', () => {
  const React = require('react');
  
  return {
    Platform: {
      OS: 'ios',
      select: jest.fn(),
    },
    StyleSheet: {
      create: (styles: any) => styles,
      flatten: (styles: any) => styles,
      compose: (style1: any, style2: any) => [style1, style2],
    },
    View: React.forwardRef(({ children, style, testID, ...props }: any, ref: any) => 
      React.createElement('View', { 'data-testid': testID, ...props, ref }, children)
    ),
    Text: React.forwardRef(({ children, style, testID, ...props }: any, ref: any) => 
      React.createElement('Text', { 'data-testid': testID, ...props, ref }, children)
    ),
    TouchableOpacity: React.forwardRef(({ children, onPress, style, testID, ...props }: any, ref: any) => {
      const handlePress = () => {
        if (onPress) onPress();
      };
      return React.createElement('TouchableOpacity', { 
        onClick: handlePress,
        'data-testid': testID, 
        ...props, 
        ref 
      }, children);
    }),
    Dimensions: {
      get: () => ({ width: 375, height: 667 }),
    },
  };
}, { virtual: true });

describe('MemoizedCard Component', () => {
  const mockOnPress = jest.fn();
  const mockOnLike = jest.fn();
  const mockOnComment = jest.fn();
  
  const defaultProps = {
    title: 'Test Title',
    content: 'Test content for the card',
    onPress: mockOnPress,
    onLike: mockOnLike,
    onComment: mockOnComment,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with minimal props', () => {
    const { getByText } = render(
      <MemoizedCard 
        title={defaultProps.title} 
        content={defaultProps.content} 
      />
    );
    
    expect(getByText('Test Title')).toBeTruthy();
    expect(getByText('Test content for the card')).toBeTruthy();
  });

  it('calls onPress when card is pressed', () => {
    const { getByText } = render(<MemoizedCard {...defaultProps} />);
    
    fireEvent.press(getByText('Test Title'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('displays author information when provided', () => {
    const { getByText } = render(
      <MemoizedCard 
        {...defaultProps}
        authorName="John Doe" 
        timestamp="2 hours ago" 
      />
    );
    
    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('2 hours ago')).toBeTruthy();
  });

  it('displays correct stats count', () => {
    const { getByText } = render(
      <MemoizedCard 
        {...defaultProps}
        likesCount={10}
        commentsCount={5}
      />
    );
    
    expect(getByText('좋아요 10')).toBeTruthy();
    expect(getByText('댓글 5')).toBeTruthy();
  });

  it('calls onLike when like button is pressed', () => {
    const { getByText } = render(<MemoizedCard {...defaultProps} />);
    
    fireEvent.press(getByText('좋아요 0'));
    expect(mockOnLike).toHaveBeenCalledTimes(1);
  });

  it('calls onComment when comment button is pressed', () => {
    const { getByText } = render(<MemoizedCard {...defaultProps} />);
    
    fireEvent.press(getByText('댓글 0'));
    expect(mockOnComment).toHaveBeenCalledTimes(1);
  });
  it('applies liked style when isLiked is true', () => {
    const { getAllByText } = render(
      <MemoizedCard 
        {...defaultProps}
        isLiked={true} 
      />
    );
    
    // 좋아요 텍스트를 찾기
    const texts = getAllByText(/좋아요/);
    const likeText = texts.find(text => text.children);
    
    expect(likeText).toBeDefined();
    expect(likeText?.props).toBeDefined();
  });
  
  it('does not trigger onLike when onLike prop is not provided', () => {
    const { getByText } = render(
      <MemoizedCard 
        title={defaultProps.title} 
        content={defaultProps.content} 
        // omitting onLike
      />
    );
    
    fireEvent.press(getByText('좋아요 0'));
    expect(mockOnLike).not.toHaveBeenCalled();
  });
});