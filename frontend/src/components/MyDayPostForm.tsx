// components/MyDayPostForm.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Platform, Alert } from 'react-native';
import EmotionSelector from './EmotionSelector';
import LoadingIndicator from './LoadingIndicator';
import uploadService from '../services/api/uploadService';
// 이미지 선택 함수
const selectImage = async (): Promise<{uri: string; name?: string; type?: string} | null> => {
  return new Promise((resolve) => {
    // 여기서는 간단한 모의 함수로 대체
    // 실제 구현에서는 react-native-image-picker 또는 expo-image-picker 등을 사용
    setTimeout(() => {
      // 성공 시 이미지 정보 반환
      resolve({
        uri: 'file:///mock/image/path.jpg',
        name: 'image.jpg',
        type: 'image/jpeg'
      });
      
      // 취소 시 null 반환
      // resolve(null);
    }, 500);
  });
};

// 타입 정의
interface MyDayPostFormProps {
  onSubmit: (postData: {
    content: string;
    emotion_ids: number[];
    emotion_summary?: string;
    image_url?: string;
    is_anonymous: boolean;
  }) => Promise<void>;
  isLoading?: boolean;
  initialContent?: string;
  initialEmotionIds?: number[];
  maxContentLength?: number;
}

interface Emotion {
  emotion_id: number;
  name: string;
  icon: string;
  color: string;
}

const MyDayPostForm: React.FC<MyDayPostFormProps> = ({
  onSubmit,
  isLoading = false,
  initialContent = '',
  initialEmotionIds = [],
  maxContentLength = 1000
}) => {
  const [content, setContent] = useState<string>(initialContent);
  const [emotionIds, setEmotionIds] = useState<number[]>(initialEmotionIds);
  const [emotionSummary, setEmotionSummary] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [imageUploadLoading, setImageUploadLoading] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<{
    uri: string;
    name?: string;
    type?: string;
  } | null>(null);

  // 감정 선택 처리
  const handleEmotionSelect = (emotionId: number, isSelected: boolean) => {
    if (isSelected) {
      // 감정 추가
      setEmotionIds(prev => [...prev, emotionId]);
    } else {
      // 감정 제거
      setEmotionIds(prev => prev.filter(id => id !== emotionId));
    }
    
    // 감정 요약 생성은 별도 함수로 처리 필요
    updateEmotionSummary();
  };
  
  // 감정 요약 업데이트 함수
  const updateEmotionSummary = () => {
    // 여기서는 간단하게 처리하지만, 실제로는 감정 ID를 이름으로 변환하는 로직이 필요
    const summary = emotionIds.length > 0 ? `선택된 감정: ${emotionIds.length}개` : '';
    setEmotionSummary(summary);
  };

  // 이미지 업로드 처리
  const handleImageSelect = async () => {
    try {
      const result = await selectImage();
      
      if (!result) {
        // 사용자가 취소한 경우
        return;
      }
      
      setSelectedImage(result);
      
      // 이미지 미리보기 설정
      setImageUrl(result.uri);
    } catch (error) {
      console.error('이미지 선택 오류:', error);
      Alert.alert('오류', '이미지를 선택하는 중 문제가 발생했습니다.');
    }
  };

  // 이미지 업로드 함수
  const uploadImage = async (): Promise<string | undefined> => {
    if (!selectedImage) {
      return undefined;
    }
    
    // 업로드할 이미지 URI 확인
    const imageUri = selectedImage.uri;
    if (!imageUri) {
      return undefined;
    }
    
    try {
      setImageUploadLoading(true);
      
      // 이미지 업로드 (uploadService 사용)
      // 실제 구현에서는 API 호출을 사용합니다
      // 모의 응답으로 대체합니다
      // const response = await uploadService.uploadImage(imageUri);
      
      // 3초 지연을 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 모의 응답 생성
      const mockResponse = {
        data: {
          image_url: `https://example.com/uploads/${Date.now()}.jpg`,
          original_name: 'image.jpg',
          file_size: 12345
        }
      };
      
      setImageUploadLoading(false);
      
      return mockResponse.data.image_url;
    } catch (error) {
      setImageUploadLoading(false);
      console.error('이미지 업로드 오류:', error);
      Alert.alert('업로드 실패', '이미지 업로드 중 오류가 발생했습니다. 다시 시도해 주세요.');
      return undefined;
    }
  };

  // 게시물 제출 처리
  const handleSubmit = async () => {
    if (content.trim().length < 10) {
      Alert.alert('오류', '내용은 최소 10자 이상이어야 합니다.');
      return;
    }
    
    if (emotionIds.length === 0) {
      Alert.alert('오류', '적어도 하나 이상의 감정을 선택해주세요.');
      return;
    }
    
    try {
      let finalImageUrl = imageUrl;
      
      // 선택된 이미지가 있고 로컬 이미지인 경우 업로드
      if (selectedImage && selectedImage.uri && selectedImage.uri.startsWith('file://')) {
        finalImageUrl = await uploadImage();
      }
      
      await onSubmit({
        content,
        emotion_ids: emotionIds,
        emotion_summary: emotionSummary,
        image_url: finalImageUrl,
        is_anonymous: isAnonymous
      });
      
      // 성공 후 폼 초기화
      setContent('');
      setEmotionIds([]);
      setEmotionSummary('');
      setImageUrl(undefined);
      setSelectedImage(null);
      setIsAnonymous(false);
    } catch (error) {
      console.error('게시물 제출 오류:', error);
      Alert.alert('제출 실패', '게시물을 제출하는 중 오류가 발생했습니다. 다시 시도해 주세요.');
    }
  };

  // 이미지 제거
  const handleRemoveImage = () => {
    setImageUrl(undefined);
    setSelectedImage(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>오늘 하루는 어땠나요?</Text>
      
      {/* 감정 선택기 */}
      <View style={styles.emotionSelectorContainer}>
        <Text style={styles.sectionTitle}>오늘의 감정</Text>
        <View>
          {/* 실제 프로젝트에서는 EmotionSelector 컴포넌트를 사용합니다 */}
          {/* 여기서는 placeholder로 대체합니다 */}
          <TouchableOpacity 
            style={styles.selectorPlaceholder}
            onPress={() => Alert.alert('감정 선택', '감정을 선택해주세요.')}
          >
            <Text style={styles.selectorPlaceholderText}>
              {emotionIds.length > 0 
                ? `${emotionIds.length}개의 감정이 선택됨` 
                : '감정을 선택해주세요'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* 내용 입력 */}
      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>오늘 있었던 일</Text>
        <TextInput
          style={styles.contentInput}
          value={content}
          onChangeText={setContent}
          placeholder="오늘 하루를 기록해보세요 (10-1000자)"
          multiline
          maxLength={maxContentLength}
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>
          {content.length}/{maxContentLength}
        </Text>
      </View>
      
      {/* 이미지 업로드 */}
      <View style={styles.imageContainer}>
        <TouchableOpacity 
          style={styles.imagePicker} 
          onPress={handleImageSelect}
          disabled={isLoading || imageUploadLoading}
        >
          <Text style={styles.imageButtonText}>사진 추가</Text>
        </TouchableOpacity>
        
        {imageUrl && (
          <View style={styles.selectedImageContainer}>
            <Image source={{ uri: imageUrl }} style={styles.selectedImage} />
            <TouchableOpacity 
              style={styles.removeImageButton} 
              onPress={handleRemoveImage}
              disabled={isLoading || imageUploadLoading}
            >
              <Text style={styles.removeImageText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      {/* 익명 설정 */}
      <View style={styles.anonymousContainer}>
        <TouchableOpacity 
          style={[
            styles.checkbox, 
            isAnonymous && styles.checkboxChecked
          ]} 
          onPress={() => setIsAnonymous(!isAnonymous)}
          disabled={isLoading}
        >
          {isAnonymous && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>
        <Text style={styles.anonymousText}>익명으로 게시하기</Text>
      </View>
      
      {/* 제출 버튼 */}
      <TouchableOpacity 
        style={[
          styles.submitButton,
          (isLoading || imageUploadLoading || content.trim().length < 10 || emotionIds.length === 0) && styles.disabledButton
        ]} 
        onPress={handleSubmit}
        disabled={isLoading || imageUploadLoading || content.trim().length < 10 || emotionIds.length === 0}
      >
        {isLoading || imageUploadLoading ? (
          <LoadingIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.submitButtonText}>게시하기</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  emotionSelectorContainer: {
    marginBottom: 16,
  },
  contentContainer: {
    marginBottom: 16,
  },
  contentInput: {
    height: 120,
    borderWidth: 1,
    borderColor: '#E1E8ED',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
  },
  charCount: {
    fontSize: 12,
    color: '#657786',
    textAlign: 'right',
    marginTop: 4,
  },
  selectorPlaceholder: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E1E8ED',
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
  },
  selectorPlaceholderText: {
    fontSize: 16,
    color: '#657786',
  },
  imageContainer: {
    marginBottom: 16,
  },
  imagePicker: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#4A6572',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageButtonText: {
    color: '#4A6572',
    fontSize: 16,
  },
  selectedImageContainer: {
    marginTop: 8,
    position: 'relative',
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  anonymousContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#4A6572',
    borderRadius: 4,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4A6572',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  anonymousText: {
    fontSize: 16,
    color: '#14171A',
  },
  submitButton: {
    backgroundColor: '#4A6572',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#A9A9A9',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MyDayPostForm;