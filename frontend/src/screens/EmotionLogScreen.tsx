// src/screens/EmotionLogScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, Chip, Button, TextInput, ActivityIndicator } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import emotionService from '../services/api/emotionService';

interface Emotion {
  emotion_id: number;
  name: string;
  icon: string;
  color: string;
}

interface EmotionResponse {
  status: string;
  data: Emotion[];
}

const EmotionLogScreen = ({ navigation }: any) => {
  const [emotions, setEmotions] = useState<Emotion[]>([]);
  const [selectedEmotions, setSelectedEmotions] = useState<number[]>([]);
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadEmotions();
  }, []);

  const loadEmotions = async () => {
    setIsLoading(true);
    try {
      const response = await emotionService.getAllEmotions();
      // 타입 안전하게 접근
      const emotionResponse = response.data as EmotionResponse;
      setEmotions(emotionResponse.data);
    } catch (error) {
      Alert.alert('오류', '감정 데이터를 불러오는 중 오류가 발생했습니다.');
      console.error('감정 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEmotion = (emotionId: number) => {
    if (selectedEmotions.includes(emotionId)) {
      setSelectedEmotions(selectedEmotions.filter(id => id !== emotionId));
    } else {
      setSelectedEmotions([...selectedEmotions, emotionId]);
    }
  };

  const handleSubmit = async () => {
    if (selectedEmotions.length === 0) {
      Alert.alert('알림', '감정을 적어도 하나 이상 선택해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      await emotionService.recordEmotions({
        emotion_ids: selectedEmotions,
        note: note.trim() || undefined
      });
      
      Alert.alert(
        '감정 기록 완료',
        '오늘의 감정이 성공적으로 기록되었습니다.',
        [{ text: '확인', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      Alert.alert(
        '오류',
        error.response?.data?.message || '감정 기록 중 오류가 발생했습니다.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>감정 데이터를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>오늘의 감정</Text>
      <Text style={styles.subtitle}>현재 어떤 감정을 느끼고 계신가요?</Text>

      <View style={styles.emotionsContainer}>
        {emotions.map((emotion) => (
          <Chip
            key={emotion.emotion_id}
            selected={selectedEmotions.includes(emotion.emotion_id)}
            onPress={() => toggleEmotion(emotion.emotion_id)}
            style={[
              styles.emotionChip,
              selectedEmotions.includes(emotion.emotion_id) && { backgroundColor: emotion.color }
            ]}
            textStyle={{
              color: selectedEmotions.includes(emotion.emotion_id) ? '#FFFFFF' : emotion.color
            }}
            icon={() => (
              <MaterialCommunityIcons
                name={emotion.icon}
                size={20}
                color={selectedEmotions.includes(emotion.emotion_id) ? '#FFFFFF' : emotion.color}
              />
            )}
          >
            {emotion.name}
          </Chip>
        ))}
      </View>

      <TextInput
        label="감정에 대한 메모 (선택사항)"
        value={note}
        onChangeText={setNote}
        mode="outlined"
        multiline
        numberOfLines={4}
        style={styles.noteInput}
        testID="emotion-note-input"
      />

<Button
  mode="contained"
  onPress={handleSubmit}
  style={styles.submitButton}
  disabled={isSubmitting || selectedEmotions.length === 0}
  testID="emotion-submit-button"
>
  {isSubmitting ? <ActivityIndicator color="#fff" /> : '감정 기록하기'}
</Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#4a0e4e',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  emotionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  emotionChip: {
    margin: 4,
  },
  noteInput: {
    marginBottom: 24,
  },
  submitButton: {
    paddingVertical: 8,
  },
});

export default EmotionLogScreen;