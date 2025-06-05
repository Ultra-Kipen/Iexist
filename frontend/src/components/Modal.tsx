// Modal.tsx - 웹 환경용 수정 버전
import React, { ReactNode, CSSProperties } from 'react';

interface ModalProps {
  isVisible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  animationType?: 'none' | 'slide' | 'fade';
  closeOnBackdropPress?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isVisible,
  onClose,
  title,
  children,
  footer,
  animationType = 'fade',
  closeOnBackdropPress = true,
}) => {
  if (!isVisible) return null;

  const handleBackdropPress = () => {
    if (closeOnBackdropPress) {
      onClose();
    }
  };

  // 인라인 스타일 정의
  const styles = {
    backdrop: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    } as CSSProperties,
    modalContainer: {
      width: '85%',
      maxWidth: '500px',
      backgroundColor: 'white',
      borderRadius: '10px',
      overflow: 'hidden',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.25)',
    } as CSSProperties,
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '15px',
      borderBottom: '1px solid #f0f0f0',
    } as CSSProperties,
    headerText: {
      margin: 0,
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#333',
    } as CSSProperties,
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '24px',
      color: '#999',
      cursor: 'pointer',
      padding: '5px',
      lineHeight: 1,
    } as CSSProperties,
    content: {
      padding: '15px',
    } as CSSProperties,
    footer: {
      padding: '15px',
      borderTop: '1px solid #f0f0f0',
      display: 'flex',
      justifyContent: 'flex-end',
    } as CSSProperties,
  };

  return (
    <div 
      style={styles.backdrop} 
      onClick={handleBackdropPress}
      data-testid="modal-backdrop"
    >
      <div 
        style={styles.modalContainer} 
        onClick={(e: React.MouseEvent) => e.stopPropagation()} 
        data-testid="modal-container"
      >
        {title && (
          <div style={styles.header} data-testid="modal-header">
            <h3 style={styles.headerText}>{title}</h3>
            <button 
              style={styles.closeButton} 
              onClick={onClose}
              data-testid="modal-close-button"
            >
              &times;
            </button>
          </div>
        )}
        <div style={styles.content} data-testid="modal-content-container">
          {children}
        </div>
        {footer && (
          <div style={styles.footer} data-testid="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;