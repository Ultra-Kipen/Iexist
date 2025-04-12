// src/screens/MyGoalsScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import goalService, { Goal } from '../services/api/goalService';
import emotionService, { Emotion } from '../services/api/emotionService';
import LoadingIndicator from '../components/LoadingIndicator';
import Card from '../components/Card';
import Button from '../components/Button';
import DateTimePicker from '@react-native-community/datetimepicker';
import EmotionSelector from '../components/EmotionSelector';

const MyGoalsScreen = () => {
  const navigation = useNavigation();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [emotions, setEmotions] = useState<Emotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // 새 목표 생성 상태
  const [selectedEmotionId, setSelectedEmotionId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)); // 한 달 후
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const [goalsResponse, emotionsResponse] = await Promise.all([
        goalService.getGoals(),
        emotionService.getAllEmotions(),
      ]);
      
      setGoals(goalsResponse.data.data);
      setEmotions(emotionsResponse.data.data);
    } catch (err) {
      console.error('데이터 로딩 오류:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCreateGoal = async () => {
    if (!selectedEmotionId) {
      Alert.alert('알림', '목표 감정을 선택해주세요.');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const response = await goalService.createGoal({
        target_emotion_id: selectedEmotionId,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
      });
      
      setGoals([...goals, response.data.data]);
      resetForm();
      Alert.alert('성공', '새로운 감정 목표가 생성되었습니다.');
    } catch (err) {
      console.error('목표 생성 오류:', err);
      Alert.alert('오류', '목표 생성 중 문제가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGoal = async (goalId: number) => {
    Alert.alert(
      '목표 삭제',
      '정말 이 목표를 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await goalService.deleteGoal(goalId);
              setGoals(goals.filter(goal => goal.goal_id !== goalId));
              Alert.alert('성공', '목표가 삭제되었습니다.');
            } catch (err) {
              console.error('목표 삭제 오류:', err);
              Alert.alert('오류', '목표 삭제 중 문제가 발생했습니다.');
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setSelectedEmotionId(null);
    setStartDate(new Date());
    setEndDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
    setShowCreateForm(false);
  };

  const handleEmotionSelect = (emotionId: number) => {
    setSelectedEmotionId(emotionId === selectedEmotionId ? null : emotionId);
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getEmotionById = (emotionId: number) => {
    return emotions.find(emotion => emotion.emotion_id === emotionId);
  };

  const renderGoalItem = ({ item }: { item: Goal }) => {
    const emotion = getEmotionById(item.target_emotion_id);
    const now = new Date();
    const end = new Date(item.end_date);
    const isActive = now <= end;
    const daysLeft = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    
    return (
      <Card style={styles.goalCard}>
        <View style={styles.goalHeader}>
          <View style={[styles.emotionTag, { backgroundColor: `${item.emotion_color}20` }]}>
            <Text style={[styles.emotionText, { color: item.emotion_color }]}>
              {item.emotion_name}
            </Text>
          </View>
          
          <TouchableOpacity onPress={() => handleDeleteGoal(item.goal_id)}>
            <Text style={styles.deleteIcon}>🗑️</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.goalDates}>
          <Text style={styles.goalDate}>{formatDate(item.start_date)} ~ {formatDate(item.end_date)}</Text>
          {isActive ? (
            <Text style={styles.daysLeft}>남은 기간: {daysLeft}일</Text>
          ) : (
            <Text style={styles.completed}>완료됨</Text>
          )}
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${item.progress}%`, backgroundColor: item.emotion_color }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{item.progress}%</Text>
        </View>
      </Card>
    );
  };

  if (loading && !refreshing) {
    return <LoadingIndicator text="목표 데이터 로딩 중..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>나의 감정 목표</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowCreateForm(!showCreateForm)}
        >
          <Text style={styles.addButtonText}>
            {showCreateForm ? '취소' : '새 목표 추가'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button title="다시 시도" onPress={() => fetchData(true)} type="primary" />
        </View>
      )}
      
      {showCreateForm && (
        <Card title="새 감정 목표 생성">
          <Text style={styles.formLabel}>목표 감정</Text>
          <EmotionSelector
           emotions={emotions.map(emotion => ({
            id: emotion.emotion_id,
            name: emotion.name,
            icon: emotion.icon,
            color: emotion.color
          }))}
            selectedEmotions={selectedEmotionId ? [selectedEmotionId] : []}
            onSelect={handleEmotionSelect}
            multiple={false}
          />
          
          <View style={styles.dateContainer}>
            <View style={styles.dateField}>
              <Text style={styles.formLabel}>시작일</Text>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Text>{formatDate(startDate.toISOString())}</Text>
              </TouchableOpacity>
              
              {showStartDatePicker && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display="default"
                  onChange={handleStartDateChange}
                  minimumDate={new Date()}
                />
              )}
            </View>
            
            <View style={styles.dateField}>
              <Text style={styles.formLabel}>종료일</Text>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Text>{formatDate(endDate.toISOString())}</Text>
              </TouchableOpacity>
              
              {showEndDatePicker && (
                <DateTimePicker
                  value={endDate}
                  mode="date"
                  display="default"
                  onChange={handleEndDateChange}
                  minimumDate={startDate}
                />
              )}
            </View>
          </View>
          
          <Button
            title="목표 생성하기"
            onPress={handleCreateGoal}
            type="primary"
            loading={submitting}
            disabled={!selectedEmotionId}
            style={styles.submitButton}
          />
        </Card>
      )}
      
      {goals.length > 0 ? (
        <FlatList
          data={goals}
          renderItem={renderGoalItem}
          keyExtractor={(item) => item.goal_id.toString()}
          contentContainerStyle={styles.goalsList}
          onRefresh={() => fetchData(true)}
          refreshing={refreshing}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            아직 설정된 감정 목표가 없습니다.
          </Text>
          {!showCreateForm && (
            <Button
              title="새 목표 추가하기"
              onPress={() => setShowCreateForm(true)}
              type="primary"
              style={styles.emptyButton}
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  addButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#4A90E2',
    borderRadius: 16,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 14,
  },
  goalsList: {
    padding: 16,
  },
  goalCard: {
    marginBottom: 16,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  emotionTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  emotionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  deleteIcon: {
    fontSize: 18,
  },
  goalDates: {
    marginBottom: 12,
  },
  goalDate: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  daysLeft: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4A90E2',
  },
  completed: {
    fontSize: 14,
    fontWeight: '500',
    color: '#27AE60',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    width: 40,
    textAlign: 'right',
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  dateField: {
    flex: 1,
    marginRight: 8,
  },
  dateButton: {
    height: 40,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  submitButton: {
    marginTop: 24,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyButton: {
    width: 200,
  },
});

export default MyGoalsScreen;