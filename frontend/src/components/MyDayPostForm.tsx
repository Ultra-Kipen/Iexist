// components/MyDayPostForm.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Platform, Alert } from 'react-native';
import EmotionSelector from './EmotionSelector';
import LoadingIndicator from './LoadingIndicator';
import uploadService from '../services/api/uploadService';

// 이미지 선택 함수 - 실제 앱에서는 image-picker 라이브러리를 사용할 것
const selectImage = async (): Promise<{uri: string; name?: string; type?: string} | null> => {
  return new Promise((resolve) => {
    // 모의 함수로 대체
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

// EmotionSelector에서 사용하는 Emotion 인터페이스와 호환되는 타입 정의
interface EmotionData {
  id: number;  // EmotionSelector에서 사용하는 필드명
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
  const [emotions, setEmotions] = useState<EmotionData[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 감정 목록 가져오기
  useEffect(() => {
    const fetchEmotions = async () => {
      try {
        // 임시 감정 데이터
        const mockEmotions: EmotionData[] = [
          { id: 1, name: '행복', icon: 'emoticon-happy-outline', color: '#FFD700' },
          { id: 2, name: '감사', icon: 'hand-heart', color: '#FF69B4' },
          { id: 3, name: '위로', icon: 'hand-peace', color: '#87CEEB' },
          { id: 4, name: '감동', icon: 'heart-outline', color: '#FF6347' },
          { id: 5, name: '슬픔', icon: 'emoticon-sad-outline', color: '#4682B4' },
          { id: 6, name: '불안', icon: 'alert-outline', color: '#DDA0DD' },
          { id: 7, name: '화남', icon: 'emoticon-angry-outline', color: '#FF4500' },
          { id: 8, name: '지침', icon: 'emoticon-neutral-outline', color: '#A9A9A9' },
          { id: 9, name: '우울', icon: 'weather-cloudy', color: '#708090' },
          { id: 10, name: '고독', icon: 'account-outline', color: '#8B4513' },
          { id: 11, name: '충격', icon: 'lightning-bolt', color: '#9932CC' },
          { id: 12, name: '편함', icon: 'sofa-outline', color: '#32CD32' }
        ];
        setEmotions(mockEmotions);
      } catch (error) {
        console.error('감정 목록 가져오기 오류:', error);
        setError('감정 목록을 불러오는데 실패했습니다.');
      }
    };
    
    fetchEmotions();
  }, []);

  // 감정 선택 처리
  const handleEmotionSelect = (emotionId: number) => {
    if (emotionIds.includes(emotionId)) {
      // 이미 선택된 감정이면 선택 해제
      setEmotionIds(prev => prev.filter(id => id !== emotionId));
    } else {
      // 새 감정 선택
      setEmotionIds(prev => [...prev, emotionId]);
    }
    
    // 감정 요약 업데이트 (다음 렌더링 주기에 갱신됨)
    setTimeout(() => updateEmotionSummary(), 0);
  };
  
  // 감정 요약 업데이트 함수
  const updateEmotionSummary = () => {
    if (emotionIds.length === 0) {
      setEmotionSummary('');
      return;
    }
    
    // 감정 ID를 이름으로 변환
    const selectedEmotions = emotions.filter(emotion => emotionIds.includes(emotion.id));
    const emotionNames = selectedEmotions.map(emotion => emotion.name);
    
    let summary = '';
    if (emotionNames.length <= 2) {
      summary = emotionNames.join(', ');
    } else {
      summary = `${emotionNames[0]}, ${emotionNames[1]} 외 ${emotionNames.length - 2}개`;
    }
    
    setEmotionSummary(summary);
  };

  // 감정 데이터 업데이트 시 요약 업데이트
  useEffect(() => {
    if (emotions.length > 0 && emotionIds.length > 0) {
      updateEmotionSummary();
    }
  }, [emotions, emotionIds]);

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
      
      // 이미지 업로드
      // FormData 대신 직접 파일 URI를 전달
      const response = await uploadService.uploadImage(imageUri);
      
      if (!response || !response.data || !response.data.image_url) {
        throw new Error('이미지 업로드 응답이 유효하지 않습니다.');
      }
      
      setImageUploadLoading(false);
      
      return response.data.image_url;
    } catch (error) {
      setImageUploadLoading(false);
      console.error('이미지 업로드 오류:', error);
      Alert.alert('업로드 실패', '이미지 업로드 중 오류가 발생했습니다. 다시 시도해 주세요.');
      return undefined;
    }
  };

  // 게시물 제출 처리
  const handleSubmit = async () => {
    try {
      // 유효성 검사
      if (content.trim().length < 10) {
        Alert.alert('오류', '내용은 최소 10자 이상이어야 합니다.');
        return;
      }
      
      if (emotionIds.length === 0) {
        Alert.alert('오류', '적어도 하나 이상의 감정을 선택해주세요.');
        return;
      }
      
      let finalImageUrl = imageUrl;
      
      // 선택된 이미지가 있고 로컬 이미지인 경우 업로드
      if (selectedImage && selectedImage.uri && selectedImage.uri.startsWith('file://')) {
        finalImageUrl = await uploadImage();
        if (!finalImageUrl && selectedImage) {
          // 업로드 실패 시 사용자에게 알림
          Alert.alert(
            '업로드 경고',
            '이미지 업로드에 실패했습니다. 이미지 없이 게시물을 등록하시겠습니까?',
            [
              { text: '취소', style: 'cancel' },
              { 
                text: '이미지 없이 등록', 
                onPress: async () => {
                  try {
                    await onSubmit({
                      content,
                      emotion_ids: emotionIds,
                      emotion_summary: emotionSummary,
                      is_anonymous: isAnonymous
                    });
                    
                    // 성공 후 폼 초기화
                    resetForm();
                  } catch (submitError) {
                    handleSubmitError(submitError);
                  }
                }
              }
            ]
          );
          return;
        }
      }
      
      await onSubmit({
        content,
        emotion_ids: emotionIds,
        emotion_summary: emotionSummary,
        image_url: finalImageUrl,
        is_anonymous: isAnonymous
      });
      
      // 성공 후 폼 초기화
      resetForm();
    } catch (error) {
      handleSubmitError(error);
    }
  };

  // 폼 초기화 함수
  const resetForm = () => {
    setContent('');
    setEmotionIds([]);
    setEmotionSummary('');
    setImageUrl(undefined);
    setSelectedImage(null);
    setIsAnonymous(false);
  };

  // 제출 오류 처리 함수
  const handleSubmitError = (error: any) => {
    console.error('게시물 제출 오류:', error);
    
    // API 응답에서 오류 메시지 추출 시도
    let errorMessage = '게시물을 제출하는 중 오류가 발생했습니다. 다시 시도해 주세요.';
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage = error.response.data.message;
    }
    
    Alert.alert('제출 실패', errorMessage);
  };

  // 이미지 제거
  const handleRemoveImage = () => {
    setImageUrl(undefined);
    setSelectedImage(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>오늘 하루는 어땠나요?</Text>
      
      {/* 오류 메시지 */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      {/* 감정 선택기 */}
      <View style={styles.emotionSelectorContainer}>
        {emotions.length > 0 ? (
          <EmotionSelector
            emotions={emotions}
            selectedEmotions={emotionIds}
            onSelect={handleEmotionSelect}
            multiple={true}
          />
        ) : (
          <View>
            <Text style={styles.sectionTitle}>오늘의 감정</Text>
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
        )}
        {emotionSummary ? (
          <Text style={styles.emotionSummary}>{emotionSummary}</Text>
        ) : null}
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
        <Text style={[
          styles.charCount,
          content.length >= maxContentLength * 0.9 && styles.charCountWarning
        ]}>
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
  errorContainer: {
    backgroundColor: '#FFE5E5',
    padding: 8,
    borderRadius: 4,
    marginBottom: 16,
  },
  errorText: {
    color: '#D32F2F',
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
  emotionSummary: {
    fontSize: 14,
    color: '#657786',
    marginTop: 8,
    marginLeft: 16,
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
  charCountWarning: {
    color: '#E0245E',
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