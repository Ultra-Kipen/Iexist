// components/ComfortWallForm.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import LoadingIndicator from './LoadingIndicator';
import TagSelector from './TagSelector';

interface ComfortWallFormProps {
  onSubmit: (data: {
    title: string;
    content: string;
    tag_ids: number[];
    is_anonymous: boolean;
  }) => Promise<void>;
  isLoading?: boolean;
}

interface Tag {
  tag_id: number;
  name: string;
}

const TITLE_MAX_LENGTH = 100;
const CONTENT_MAX_LENGTH = 2000;

const ComfortWallForm: React.FC<ComfortWallFormProps> = ({
  onSubmit,
  isLoading = false
}) => {
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [tagIds, setTagIds] = useState<number[]>([]);
  const [isAnonymous, setIsAnonymous] = useState<boolean>(true); // 기본값으로 익명 설정
  
  // 태그 선택 처리
  const handleTagSelect = (tagId: number) => {
    setTagIds(prevTagIds => [...prevTagIds, tagId]);
  };
  
  // 폼 제출 처리
  const handleSubmit = async () => {
    // 유효성 검사
    if (title.trim().length < 5) {
      Alert.alert('안내', '제목은 5자 이상 입력해주세요.');
      return;
    }
    
    if (content.trim().length < 20) {
      Alert.alert('안내', '내용은 20자 이상 입력해주세요.');
      return;
    }
    
    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        tag_ids: tagIds,
        is_anonymous: isAnonymous
      });
      
      // 성공 후 폼 초기화
      setTitle('');
      setContent('');
      setTagIds([]);
      setIsAnonymous(true);
    } catch (error) {
      console.error('게시물 제출 오류:', error);
      Alert.alert('오류', '게시물 작성 중 문제가 발생했습니다. 다시 시도해주세요.');
    }
  };
  
  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>위로의 벽에 글 남기기</Text>
        <Text style={styles.subtitle}>
          당신의 고민을 익명으로 공유하고 위로와 조언을 받아보세요.
        </Text>
        
        {/* 제목 입력 */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>제목</Text>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="제목을 입력하세요 (5-100자)"
            maxLength={TITLE_MAX_LENGTH}
          />
          <Text style={styles.charCount}>
            {title.length}/{TITLE_MAX_LENGTH}
          </Text>
        </View>
        
        {/* 태그 선택 */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>태그 <Text style={styles.optional}>(선택사항)</Text></Text>
          <TagSelector 
            tags={[]} // Replace with the actual tags array
            onTagSelect={handleTagSelect} 
            selectedTags={tagIds} 
          />
          <Text style={styles.helperText}>
            태그를 추가하면 비슷한 고민을 가진 사람들이 더 쉽게 찾을 수 있어요.
          </Text>
        </View>
        
        {/* 내용 입력 */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>내용</Text>
          <TextInput
            style={styles.contentInput}
            value={content}
            onChangeText={setContent}
            placeholder="당신의 고민을 자유롭게 적어주세요 (20-2000자)"
            multiline
            textAlignVertical="top"
            maxLength={CONTENT_MAX_LENGTH}
          />
          <Text style={styles.charCount}>
            {content.length}/{CONTENT_MAX_LENGTH}
          </Text>
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
        
        {/* 안내 메시지 */}
        <View style={styles.noticeContainer}>
          <Text style={styles.noticeText}>
            ⚠️ 부적절한 내용이나 남을 비방하는 글은 신고될 수 있습니다.
          </Text>
        </View>
        
        {/* 제출 버튼 */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (isLoading || title.trim().length < 5 || content.trim().length < 20) && styles.disabledButton
          ]}
          onPress={handleSubmit}
          disabled={isLoading || title.trim().length < 5 || content.trim().length < 20}
        >
          {isLoading ? (
            <LoadingIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>작성 완료</Text>
          )}
        </TouchableOpacity>
        
        {/* 추가 안내 */}
        <Text style={styles.supportText}>
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
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4A6572',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#657786',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#14171A',
    marginBottom: 8,
  },
  optional: {
    fontWeight: 'normal',
    fontSize: 14,
    color: '#657786',
  },
  titleInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E1E8ED',
    borderRadius: 8,
    paddingHorizontal: 12,
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
  helperText: {
    fontSize: 12,
    color: '#657786',
    marginTop: 4,
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
  noticeContainer: {
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  noticeText: {
    fontSize: 14,
    color: '#856404',
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
  supportText: {
    fontSize: 14,
    color: '#657786',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default ComfortWallForm;