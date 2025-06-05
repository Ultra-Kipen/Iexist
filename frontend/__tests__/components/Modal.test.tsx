// Modal.test.tsx - React 테스트용
import React from 'react';
import { create, act } from 'react-test-renderer';
import Modal from '../../src/components/Modal';

// 테스트용 컴포넌트
const TestContent = () => <div>Test Content</div>;

describe('Modal Component', () => {
  const mockOnClose = jest.fn();
  
  beforeEach(() => {
    mockOnClose.mockClear();
  });
  
  it('renders nothing when not visible', () => {
    const tree = create(
      <Modal isVisible={false} onClose={mockOnClose}>
        <TestContent />
      </Modal>
    );
    
    expect(tree.toJSON()).toBeNull();
  });

  it('renders content when visible', () => {
    const tree = create(
      <Modal isVisible={true} onClose={mockOnClose}>
        <TestContent />
      </Modal>
    );
    
    expect(tree.toJSON()).not.toBeNull();
    expect(tree.root.findByType(TestContent)).toBeTruthy();
  });

  it('displays title when provided', () => {
    const tree = create(
      <Modal isVisible={true} onClose={mockOnClose} title="Test Modal">
        <TestContent />
      </Modal>
    );
    
    const titleElement = tree.root.findByProps({ 'data-testid': 'modal-header' });
    expect(titleElement).toBeTruthy();
    expect(titleElement.findByType('h3').props.children).toBe('Test Modal');
  });
  
  it('calls onClose when backdrop is pressed', () => {
    const tree = create(
      <Modal isVisible={true} onClose={mockOnClose} closeOnBackdropPress={true}>
        <TestContent />
      </Modal>
    );
    
    const backdrop = tree.root.findByProps({ 'data-testid': 'modal-backdrop' });
    act(() => {
      backdrop.props.onClick();
    });
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
  
  it('does not call onClose when backdrop is pressed and closeOnBackdropPress is false', () => {
    const tree = create(
      <Modal isVisible={true} onClose={mockOnClose} closeOnBackdropPress={false}>
        <TestContent />
      </Modal>
    );
    
    const backdrop = tree.root.findByProps({ 'data-testid': 'modal-backdrop' });
    act(() => {
      backdrop.props.onClick();
    });
    
    expect(mockOnClose).not.toHaveBeenCalled();
  });
  
  it('calls onClose when close button is pressed', () => {
    const tree = create(
      <Modal isVisible={true} onClose={mockOnClose} title="Test Modal">
        <TestContent />
      </Modal>
    );
    
    const closeButton = tree.root.findByProps({ 'data-testid': 'modal-close-button' });
    act(() => {
      closeButton.props.onClick();
    });
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
  
  it('renders footer when provided', () => {
    const Footer = () => <div>Footer Content</div>;
    
    const tree = create(
      <Modal 
        isVisible={true} 
        onClose={mockOnClose}
        footer={<Footer />}
      >
        <TestContent />
      </Modal>
    );
    
    const footerContainer = tree.root.findByProps({ 'data-testid': 'modal-footer' });
    expect(footerContainer).toBeTruthy();
    expect(footerContainer.findByType(Footer)).toBeTruthy();
  });
});