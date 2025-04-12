// __tests__/components/Modal.test.tsx
import React from 'react';
import { Text, View } from 'react-native'; // React Native에서 직접 가져옴
import { render, fireEvent } from '@testing-library/react-native';
import Modal from '../../src/components/Modal';

// 테스트용 컴포넌트
const TestContent = () => <View testID="modal-content"><Text>Test Content</Text></View>;

describe('Modal Component', () => {
  const mockOnClose = jest.fn();
  
  beforeEach(() => {
    mockOnClose.mockClear();
  });
  
  it('renders nothing when not visible', () => {
    const { queryByText } = render(
      <Modal isVisible={false} onClose={mockOnClose}>
        <TestContent />
      </Modal>
    );
    
    // 모달이 렌더링되지 않았으므로 내용이 보이지 않아야 함
    expect(queryByText('Test Content')).toBeNull();
  });
  
  it('renders content when visible', () => {
    const { getByText } = render(
      <Modal isVisible={true} onClose={mockOnClose}>
        <TestContent />
      </Modal>
    );
    
    expect(getByText('Test Content')).toBeTruthy();
  });
  
  it('displays title when provided', () => {
    const { getByText } = render(
      <Modal isVisible={true} onClose={mockOnClose} title="Test Modal">
        <TestContent />
      </Modal>
    );
    
    expect(getByText('Test Modal')).toBeTruthy();
  });
  
  it('calls onClose when backdrop is pressed', () => {
    const { getByTestId } = render(
      <Modal isVisible={true} onClose={mockOnClose} closeOnBackdropPress={true}>
        <TestContent />
      </Modal>
    );
    
    // Modal의 actual 구현에는 backdrop이 touchable opacity로 구현되어 있음
    const backdrop = getByTestId('modal-backdrop');
    fireEvent.press(backdrop);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
  
  it('does not call onClose when backdrop is pressed and closeOnBackdropPress is false', () => {
    const { getByTestId } = render(
      <Modal isVisible={true} onClose={mockOnClose} closeOnBackdropPress={false}>
        <TestContent />
      </Modal>
    );
    
    const backdrop = getByTestId('modal-backdrop');
    fireEvent.press(backdrop);
    
    expect(mockOnClose).not.toHaveBeenCalled();
  });
  
  it('calls onClose when close button is pressed', () => {
    const { getByText } = render(
      <Modal isVisible={true} onClose={mockOnClose} title="Test Modal">
        <TestContent />
      </Modal>
    );
    
    // 'title'이 제공되면 close 버튼('×')이 렌더링됨
    const closeButton = getByText('×');
    fireEvent.press(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
  
  it('renders footer when provided', () => {
    const Footer = () => <Text>Footer Content</Text>;
    
    const { getByText } = render(
      <Modal 
        isVisible={true} 
        onClose={mockOnClose}
        footer={<Footer />}
      >
        <TestContent />
      </Modal>
    );
    
    expect(getByText('Footer Content')).toBeTruthy();
  });
});