// src/screens/CreateChallengeScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Switch, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import challengeService, { ChallengeCreateData } from '../services/api/challengeService';
import Button from '../components/Button';
import Card from '../components/Card';


import DateTimePicker from '@react-native-community/datetimepicker';
// 또는 프로젝트에 @react-native-community/datetimepicker가 설치되어 있다면:
// import DateTimePicker from '@react-native-community/datetimepicker';

const CreateChallengeScreen = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState<ChallengeCreateData>({
    title: '',
    description: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 일주일 후
    is_public: true,
  });
  
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요.';
    } else if (formData.title.length < 3) {
      newErrors.title = '제목은 최소 3자 이상이어야 합니다.';
    }
    
    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (startDate < today) {
      newErrors.start_date = '시작일은 오늘 이후여야 합니다.';
    }
    
    if (endDate <= startDate) {
      newErrors.end_date = '종료일은 시작일 이후여야 합니다.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await challengeService.createChallenge(formData);
      
      Alert.alert(
        '챌린지 생성 완료',
        '새로운 챌린지가 생성되었습니다!',
        [
          {
            text: '확인',
            onPress: () => {
              // TS2345 오류 해결을 위한 방법
              const nav = navigation as any;
              nav.navigate('ChallengeDetail', { 
                challengeId: response.data.data.challenge_id 
              });
            },
          }
        ]
      );
    } catch (err) {
      console.error('챌린지 생성 오류:', err);
      Alert.alert('오류', '챌린지 생성 중 문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };


  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setFormData({
        ...formData,
        start_date: selectedDate.toISOString().split('T')[0],
      });
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setFormData({
        ...formData,
        end_date: selectedDate.toISOString().split('T')[0],
      });
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

  return (
    <ScrollView style={styles.container}>
      <Card title="새 챌린지 만들기">
        <View style={styles.formGroup}>
          <Text style={styles.label}>제목 *</Text>
          <TextInput
            style={[styles.input, errors.title ? styles.inputError : {}]}
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
            placeholder="챌린지 제목을 입력하세요"
            maxLength={100}
          />
          {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>설명</Text>
          <TextInput
            style={[styles.textArea, errors.description ? styles.inputError : {}]}
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            placeholder="챌린지에 대한 설명을 입력하세요"
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            maxLength={500}
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>시작일 *</Text>
          <TouchableOpacity 
            style={[styles.dateInput, errors.start_date ? styles.inputError : {}]}
            onPress={() => setShowStartDatePicker(true)}
          >
            <Text>{formatDate(formData.start_date)}</Text>
          </TouchableOpacity>
          {errors.start_date && <Text style={styles.errorText}>{errors.start_date}</Text>}
          
          {showStartDatePicker && (
            <DateTimePicker
              value={new Date(formData.start_date)}
              mode="date"
              display="default"
              onChange={handleStartDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>종료일 *</Text>
          <TouchableOpacity 
            style={[styles.dateInput, errors.end_date ? styles.inputError : {}]}
            onPress={() => setShowEndDatePicker(true)}
          >
            <Text>{formatDate(formData.end_date)}</Text>
          </TouchableOpacity>
          {errors.end_date && <Text style={styles.errorText}>{errors.end_date}</Text>}
          
          {showEndDatePicker && (
            <DateTimePicker
              value={new Date(formData.end_date)}
              mode="date"
              display="default"
              onChange={handleEndDateChange}
              minimumDate={new Date(formData.start_date)}
            />
          )}
        </View>
        
        <View style={styles.formGroup}>
          <View style={styles.switchContainer}>
            <Text style={styles.label}>공개 챌린지</Text>
            <Switch
              value={formData.is_public}
              onValueChange={(value) => setFormData({ ...formData, is_public: value })}
              trackColor={{ false: '#D1D1D1', true: '#4A90E2' }}
              thumbColor="#FFFFFF"
            />
          </View>
          <Text style={styles.helperText}>
            {formData.is_public 
              ? '모든 사용자가 이 챌린지를 볼 수 있습니다.' 
              : '초대된 사용자만 이 챌린지를 볼 수 있습니다.'}
          </Text>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>최대 참가자 수 (선택사항)</Text>
          <TextInput
            style={styles.input}
            value={formData.max_participants?.toString() || ''}
            onChangeText={(text) => {
              const value = text ? parseInt(text) : undefined;
              setFormData({ ...formData, max_participants: value });
            }}
            placeholder="제한 없음"
            keyboardType="number-pad"
          />
          <Text style={styles.helperText}>
            비워두면 참가자 수에 제한이 없습니다.
          </Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <Button
            title="취소"
            onPress={() => navigation.goBack()}
            type="outline"
            style={styles.cancelButton}
          />
          <Button
            title="챌린지 만들기"
            onPress={handleSubmit}
            type="primary"
            loading={loading}
          />
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#333333',
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  textArea: {
    height: 120,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333333',
    backgroundColor: '#FFFFFF',
  },
  dateInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#333333',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginTop: 4,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  helperText: {
    color: '#666666',
    fontSize: 14,
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    marginRight: 12,
  },
});

export default CreateChallengeScreen;