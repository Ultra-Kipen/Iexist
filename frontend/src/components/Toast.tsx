import React, { useState, useEffect, ReactNode, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  // @ts-ignore - TypeScript 오류 무시
  Animated
} from 'react-native';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  visible: boolean;
  message: string;
  duration?: number;
  onClose?: () => void;
  type?: ToastType;
  position?: 'top' | 'bottom';
  icon?: ReactNode;
  testID?: string; // testID 속성 추가
}

const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  duration = 3000,
  onClose,
  type = 'info',
  position = 'bottom',
  icon,
  testID,
}) => {
  const [isVisible, setIsVisible] = useState(visible);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      timerRef.current = setTimeout(() => {
        hideToast();
      }, duration);
    } else {
      hideToast();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [visible, duration]);

  const hideToast = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsVisible(false);
      if (onClose) onClose();
    });
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      case 'warning':
        return '#FF9800';
      case 'info':
      default:
        return '#2196F3';
    }
  };

  if (!isVisible) return null;

  const positionStyle = position === 'top' ? { top: 50 } : { bottom: 50 };

  return (
    <Animated.View
      testID={testID}
      style={[
        styles.container,
        positionStyle,
        { backgroundColor: getBackgroundColor(), opacity: fadeAnim },
      ]}
    >
      <TouchableOpacity onPress={hideToast} style={styles.content} testID="toast-touchable">
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text style={styles.text}>{message}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// 전역 상태를 위한 인스턴스 생성
let toastInstance: any = null;

// Toast 컨트롤러
export const ToastController = {
  show: (props: Omit<ToastProps, 'visible'>) => {
    if (toastInstance) {
      toastInstance.show(props);
    }
  },
  hide: () => {
    if (toastInstance) {
      toastInstance.hide();
    }
  },
  setRef: (ref: any) => {
    toastInstance = ref;
  },
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    zIndex: 9999,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: 10,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
});

export default Toast;