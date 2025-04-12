// components/SomeoneDayPostForm.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import LoadingIndicator from './LoadingIndicator';
import uploadService from '../services/api/uploadService';

// 타입 정의
interface SomeoneDayPostFormProps {
  onSubmit: (postData: {
    title: string;
    content: string;
    tag_ids: number[];
    image_url?: string;
    is_anonymous: boolean;
  }) => Promise<void>;
  isLoading?: boolean;
  initialTitle?: string;
  initialContent?: string;
  initialTagIds?: number[];
  maxTitleLength?: number;
  maxContentLength?: number;
}

interface Tag {
  tag_id: number;
  name: string;
}

const SomeoneDayPostForm: React.FC<SomeoneDayPostFormProps> = ({
  onSubmit,
  isLoading = false,
  initialTitle = '',
  initialContent = '',
  initialTagIds = [],
  maxTitleLength = 100,
  maxContentLength = 2000
}) => {
  const [title, setTitle] = useState<string>(initialTitle);
  const [content, setContent] = useState<string>(initialContent);
  const [tagIds, setTagIds] = useState<number[]>(initialTagIds);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [imageUploadLoading, setImageUploadLoading] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<{
    uri: string;
    name?: string;
    type?: string;
  } | null>(null);

  // 태그 선택 처리
  const handleTagSelect = (tag: Tag) => {
    if (tagIds.includes(tag.tag_id)) {
      return;
    }
    setTagIds([...tagIds, tag.tag_id]);
  };

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
      
      // 2초 지연을 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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
    if (title.trim().length < 5) {
      Alert.alert('오류', '제목은 최소 5자 이상이어야 합니다.');
      return;
    }
    
    if (content.trim().length < 20) {
      Alert.alert('오류', '내용은 최소 20자 이상이어야 합니다.');
      return;
    }
    
    try {
      let finalImageUrl = imageUrl;
      
      // 선택된 이미지가 있고 로컬 이미지인 경우 업로드
      if (selectedImage && selectedImage.uri && selectedImage.uri.startsWith('file://')) {
        finalImageUrl = await uploadImage();
      }
      
      await onSubmit({
        title,
        content,
        tag_ids: tagIds,
        image_url: finalImageUrl,
        is_anonymous: isAnonymous
      });
      
      // 성공 후 폼 초기화
      setTitle('');
      setContent('');
      setTagIds([]);
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

  const isSubmitDisabled = isLoading || 
                          imageUploadLoading || 
                          title.trim().length < 5 || 
                          content.trim().length < 20;

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>누군가의 하루 게시하기</Text>
        
        {/* 제목 입력 */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>제목</Text>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="제목을 입력하세요 (5-100자)"
            maxLength={maxTitleLength}
          />
          <Text style={styles.charCount}>
            {title.length}/{maxTitleLength}
          </Text>
        </View>
        
        {/* 태그 선택기 */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>태그</Text>
          <View>
            {/* 실제 프로젝트에서는 TagSelector 컴포넌트를 사용합니다 */}
            {/* 여기서는 placeholder로 대체합니다 */}
            <TouchableOpacity 
              style={styles.selectorPlaceholder}
              onPress={() => Alert.alert('태그 선택', '태그를 선택해주세요.')}
            >
              <Text style={styles.selectorPlaceholderText}>
                {tagIds.length > 0 
                  ? `${tagIds.length}개의 태그가 선택됨` 
                  : '태그를 선택해주세요 (선택사항)'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* 내용 입력 */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>내용</Text>
          <TextInput
            style={styles.contentInput}
            value={content}
            onChangeText={setContent}
            placeholder="내용을 입력하세요 (20-2000자)"
            multiline
            maxLength={maxContentLength}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>
            {content.length}/{maxContentLength}
          </Text>
        </View>
        
        {/* 이미지 업로드 */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>이미지</Text>
          <TouchableOpacity 
            style={styles.imagePicker} 
            onPress={handleImageSelect}
            disabled={isLoading || imageUploadLoading}
          >
            <Text style={styles.imageButtonText}>이미지 추가 (선택사항)</Text>
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
            isSubmitDisabled && styles.disabledButton
          ]} 
          onPress={handleSubmit}
          disabled={isSubmitDisabled}
        >
          {isLoading || imageUploadLoading ? (
            <LoadingIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>게시하기</Text>
          )}
        </TouchableOpacity>
        
        {/* 추가 안내 */}
        <Text style={styles.infoText}>
          혼자 고민하지 마세요. 여기에 공유하면 많은 사람들이 당신에게 위로와 지지를 보낼 거예요.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  container: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#4A6572',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#14171A',
  },
  titleInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E1E8ED',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
  },
  contentInput: {
    height: 200,
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
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  disabledButton: {
    backgroundColor: '#A9A9A9',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 14,
    color: '#657786',
    textAlign: 'center',
    lineHeight: 20,
  }
});

export default SomeoneDayPostForm;