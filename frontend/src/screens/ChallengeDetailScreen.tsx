// src/screens/ChallengeDetailScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Alert, TouchableOpacity, FlatList } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import challengeService from '../services/api/challengeService';
import emotionService, { Emotion } from '../services/api/emotionService';
import LoadingIndicator from '../components/LoadingIndicator';
import Button from '../components/Button';
import Card from '../components/Card';
import ProfileAvatar from '../components/ProfileAvatar';
import EmotionSelector from '../components/EmotionSelector';

// 타입 정의
type ChallengeDetailRouteParams = {
  challengeId: number;
};

type RootStackParamList = {
  ChallengeDetail: ChallengeDetailRouteParams;
};

type ChallengeDetailRouteProp = RouteProp<RootStackParamList, 'ChallengeDetail'>;

interface ChallengeDetail {
  challenge_id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  is_public: boolean;
  max_participants: number | null;
  participant_count: number;
  creator: {
    user_id: number;
    username: string;
    nickname: string | null;
  };
  is_participating: boolean;
  created_at: string;
  participants: {
    user_id: number;
    username: string;
    nickname: string | null;
    profile_image_url: string | null;
  }[];
  progress_entries: {
    date: string;
    emotion_id: number;
    emotion_name: string;
    emotion_color: string;
    note: string | null;
  }[];
}

const ChallengeDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<ChallengeDetailRouteProp>();
  const { challengeId } = route.params;
  
  const [challenge, setChallenge] = useState<ChallengeDetail | null>(null);
  const [emotions, setEmotions] = useState<Emotion[]>([]);
  const [selectedEmotionId, setSelectedEmotionId] = useState<number | null>(null);
  const [progressNote, setProgressNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChallengeData();
    fetchEmotions();
  }, [challengeId]);

  const fetchChallengeData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await challengeService.getChallengeDetails(challengeId);
      setChallenge(response.data.data);
    } catch (err) {
      console.error('챌린지 데이터 로딩 오류:', err);
      setError('챌린지 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmotions = async () => {
    try {
      const response = await emotionService.getAllEmotions();
      setEmotions(response.data.data);
    } catch (err) {
      console.error('감정 데이터 로딩 오류:', err);
    }
  };

  const handleParticipate = async () => {
    try {
      setSubmitting(true);
      
      if (challenge?.is_participating) {
        await challengeService.leaveChallenge(challengeId);
        Alert.alert('성공', '챌린지에서 탈퇴했습니다.');
      } else {
        await challengeService.participateInChallenge(challengeId);
        Alert.alert('성공', '챌린지에 참여했습니다.');
      }
      
      fetchChallengeData();
    } catch (err) {
      console.error('챌린지 참여/탈퇴 오류:', err);
      Alert.alert('오류', '요청 처리 중 문제가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitProgress = async () => {
    if (!selectedEmotionId) {
      Alert.alert('알림', '감정을 선택해주세요.');
      return;
    }
    
    try {
      setSubmitting(true);
      
      await challengeService.updateChallengeProgress(challengeId, {
        emotion_id: selectedEmotionId,
        progress_note: progressNote,
      });
      
      Alert.alert('성공', '오늘의 감정이 기록되었습니다.');
      setSelectedEmotionId(null);
      setProgressNote('');
      fetchChallengeData();
    } catch (err) {
      console.error('진행 상황 업데이트 오류:', err);
      Alert.alert('오류', '감정 기록 중 문제가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmotionSelect = (emotionId: number) => {
    setSelectedEmotionId(emotionId === selectedEmotionId ? null : emotionId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateDaysLeft = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const calculateProgress = () => {
    if (!challenge) return 0;
    
    const start = new Date(challenge.start_date);
    const end = new Date(challenge.end_date);
    const today = new Date();
    
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const passedDays = Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    return Math.min(Math.max(Math.floor((passedDays / totalDays) * 100), 0), 100);
  };

  const renderEmptyProgress = () => (
    <View style={styles.emptyProgressContainer}>
      <Text style={styles.emptyText}>
        아직 기록된 감정이 없습니다. 첫 번째 감정을 기록해보세요!
      </Text>
    </View>
  );

  const renderParticipant = ({ item }: { item: ChallengeDetail['participants'][0] }) => (
    <View style={styles.participantItem}>
      <ProfileAvatar
        imageUrl={item.profile_image_url || undefined}
        name={item.nickname || item.username}
        size={40}
        showName
      />
    </View>
  );

  const renderProgressEntry = ({ item }: { item: ChallengeDetail['progress_entries'][0] }) => (
    <Card style={styles.progressCard}>
      <View style={styles.progressEntryHeader}>
        <Text style={styles.progressEntryDate}>{formatDate(item.date)}</Text>
        <View 
          style={[
            styles.emotionTag, 
            { backgroundColor: `${item.emotion_color}20` }
          ]}
        >
          <Text style={[styles.emotionTagText, { color: item.emotion_color }]}>
            {item.emotion_name}
          </Text>
        </View>
      </View>
      
      {item.note && (
        <Text style={styles.progressNote}>{item.note}</Text>
      )}
    </Card>
  );

  if (loading) {
    return <LoadingIndicator text="챌린지 정보 로딩 중..." />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="다시 시도" onPress={fetchChallengeData} type="primary" />
      </View>
    );
  }

  if (!challenge) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>챌린지 정보를 찾을 수 없습니다.</Text>
        <Button 
          title="뒤로 가기" 
          onPress={() => navigation.goBack()} 
          type="primary" 
        />
      </View>
    );
  }

  const daysLeft = calculateDaysLeft(challenge.end_date);
  const challengeProgress = calculateProgress();
  const isActive = daysLeft >= 0;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{challenge.title}</Text>
        
        <View style={styles.creatorContainer}>
          <Text style={styles.createdBy}>만든 사람: </Text>
          <Text style={styles.creatorName}>
            {challenge.creator.nickname || challenge.creator.username}
          </Text>
        </View>
        
        <View style={styles.dateContainer}>
          <Text style={styles.date}>
            {formatDate(challenge.start_date)} ~ {formatDate(challenge.end_date)}
          </Text>
          {isActive ? (
            <Text style={styles.daysLeft}>D-{daysLeft}</Text>
          ) : (
            <Text style={styles.ended}>종료됨</Text>
          )}
        </View>
        
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${challengeProgress}%` }]} />
          <Text style={styles.progressText}>{challengeProgress}% 진행</Text>
        </View>
        
        <Text style={styles.description}>{challenge.description}</Text>
        
        <Button
          title={challenge.is_participating ? '챌린지 나가기' : '챌린지 참여하기'}
          onPress={handleParticipate}
          type={challenge.is_participating ? 'outline' : 'primary'}
          loading={submitting}
          disabled={!isActive && !challenge.is_participating}
        />
      </View>
      
      {challenge.is_participating && isActive && (
        <Card title="오늘의 감정 기록">
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
          
          <Button
            title="감정 기록하기"
            onPress={handleSubmitProgress}
            type="primary"
            loading={submitting}
            disabled={!selectedEmotionId}
            style={styles.submitButton}
          />
        </Card>
      )}
      
      <Card title={`참여자 (${challenge.participant_count}명)`}>
        <FlatList
          data={challenge.participants}
          renderItem={renderParticipant}
          keyExtractor={(item) => item.user_id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
         // ChallengeDetailScreen.tsx (계속)
         contentContainerStyle={styles.participantsContainer}
         ListEmptyComponent={
           <Text style={styles.emptyText}>아직 참여자가 없습니다.</Text>
         }
       />
     </Card>
     
     <Card title="감정 기록 내역">
       {challenge.progress_entries.length > 0 ? (
         <FlatList
           data={challenge.progress_entries}
           renderItem={renderProgressEntry}
           keyExtractor={(item, index) => `${item.date}-${index}`}
           scrollEnabled={false}
         />
       ) : (
         renderEmptyProgress()
       )}
     </Card>
   </ScrollView>
 );
};

const styles = StyleSheet.create({
 container: {
   flex: 1,
   backgroundColor: '#F7F7F7',
 },
 header: {
   backgroundColor: '#FFFFFF',
   paddingHorizontal: 16,
   paddingVertical: 20,
   marginBottom: 12,
 },
 title: {
   fontSize: 22,
   fontWeight: 'bold',
   color: '#333333',
   marginBottom: 12,
 },
 creatorContainer: {
   flexDirection: 'row',
   alignItems: 'center',
   marginBottom: 8,
 },
 createdBy: {
   fontSize: 14,
   color: '#666666',
 },
 creatorName: {
   fontSize: 14,
   fontWeight: '500',
   color: '#333333',
 },
 dateContainer: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   alignItems: 'center',
   marginBottom: 12,
 },
 date: {
   fontSize: 14,
   color: '#666666',
 },
 daysLeft: {
   fontSize: 14,
   fontWeight: 'bold',
   color: '#4A90E2',
 },
 ended: {
   fontSize: 14,
   fontWeight: 'bold',
   color: '#FF6B6B',
 },
 progressBarContainer: {
   height: 6,
   backgroundColor: '#E0E0E0',
   borderRadius: 3,
   marginVertical: 12,
   position: 'relative',
 },
 progressBar: {
   height: '100%',
   backgroundColor: '#4A90E2',
   borderRadius: 3,
 },
 progressText: {
   position: 'absolute',
   top: 10,
   right: 0,
   fontSize: 12,
   color: '#666666',
 },
 description: {
   fontSize: 14,
   color: '#333333',
   lineHeight: 20,
   marginBottom: 16,
 },
 participantsContainer: {
   paddingVertical: 8,
 },
 participantItem: {
   marginRight: 16,
 },
 progressCard: {
   marginBottom: 8,
 },
 progressEntryHeader: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   alignItems: 'center',
   marginBottom: 8,
 },
 progressEntryDate: {
   fontSize: 14,
   fontWeight: '500',
   color: '#333333',
 },
 emotionTag: {
   paddingHorizontal: 10,
   paddingVertical: 4,
   borderRadius: 16,
 },
 emotionTagText: {
   fontSize: 12,
   fontWeight: '500',
 },
 progressNote: {
   fontSize: 14,
   color: '#666666',
   lineHeight: 20,
 },
 submitButton: {
   marginTop: 16,
 },
 emptyProgressContainer: {
   paddingVertical: 20,
   alignItems: 'center',
 },
 emptyText: {
   color: '#999999',
   fontSize: 14,
   textAlign: 'center',
 },
 errorContainer: {
   flex: 1,
   justifyContent: 'center',
   alignItems: 'center',
   padding: 20,
 },
 errorText: {
   color: '#FF6B6B',
   fontSize: 16,
   marginBottom: 16,
   textAlign: 'center',
 },
});

export default ChallengeDetailScreen;