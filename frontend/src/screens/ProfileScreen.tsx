// src/screens/ProfileScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import userService, { UserProfile, UserStats } from '../services/api/userService';
import LoadingIndicator from '../components/LoadingIndicator';
import Card from '../components/Card';
import Button from '../components/Button';
import EmotionChart from '../components/EmotionChart';
import authService from '../services/api/authService';
const ProfileScreen = () => {
  const navigation = useNavigation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const profileResponse = await userService.getProfile();
      const statsResponse = await userService.getUserStats();
      
      setProfile(profileResponse.data.data);
      setStats(statsResponse.data.data);
    } catch (err) {
      console.error('프로필 데이터 로딩 오류:', err);
      setError('프로필 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile' as never);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      // AuthContext에서 로그아웃 처리
    } catch (err) {
      Alert.alert('로그아웃 오류', '로그아웃 처리 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return <LoadingIndicator text="프로필 로딩 중..." />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="다시 시도" onPress={fetchProfileData} type="primary" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* 프로필 헤더 */}
      <View style={styles.header}>
        {profile?.background_image_url ? (
          <Image source={{ uri: profile.background_image_url }} style={styles.backgroundImage} />
        ) : (
          <View style={styles.defaultBackground} />
        )}
        
        <View style={styles.profileInfo}>
          <View style={styles.avatarContainer}>
            {profile?.profile_image_url ? (
              <Image source={{ uri: profile.profile_image_url }} style={styles.avatar} />
            ) : (
              <View style={styles.defaultAvatar}>
                <Text style={styles.avatarInitial}>{profile?.nickname?.[0] || profile?.username?.[0] || '?'}</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.username}>{profile?.nickname || profile?.username}</Text>
          
          {profile?.favorite_quote && (
            <Text style={styles.quote}>"{profile.favorite_quote}"</Text>
          )}
          
          <Button
            title="프로필 편집"
            onPress={handleEditProfile}
            type="outline"
            size="small"
            style={styles.editButton}
          />
        </View>
      </View>
      
      {/* 통계 카드 */}
      <Card title="나의 활동 통계">
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats?.my_day_post_count || 0}</Text>
            <Text style={styles.statLabel}>게시물</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats?.my_day_like_received_count || 0}</Text>
            <Text style={styles.statLabel}>받은 공감</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats?.challenge_count || 0}</Text>
            <Text style={styles.statLabel}>참여 챌린지</Text>
          </View>
        </View>
      </Card>
      
      {/* 메뉴 카드 */}
      <Card>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('MyPosts' as never)}>
          <Text style={styles.menuText}>내 게시물</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('MyGoals' as never)}>
          <Text style={styles.menuText}>감정 목표</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('EmotionLog' as never)}>
          <Text style={styles.menuText}>감정 기록</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Settings' as never)}>
          <Text style={styles.menuText}>설정</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Text style={[styles.menuText, styles.logoutText]}>로그아웃</Text>
        </TouchableOpacity>
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
    marginBottom: 16,
  },
  backgroundImage: {
    height: 150,
    width: '100%',
  },
  defaultBackground: {
    height: 150,
    width: '100%',
    backgroundColor: '#E1EFF9',
  },
  profileInfo: {
    alignItems: 'center',
    marginTop: -50,
    paddingBottom: 16,
  },
  avatarContainer: {
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  defaultAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 40,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
    color: '#333333',
  },
  quote: {
    marginTop: 8,
    marginHorizontal: 32,
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#666666',
    fontSize: 14,
  },
  editButton: {
    marginTop: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  menuItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  menuText: {
    fontSize: 16,
    color: '#333333',
  },
  logoutText: {
    color: '#FF6B6B',
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

export default ProfileScreen;