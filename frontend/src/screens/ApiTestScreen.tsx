import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, ScrollView } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/api/client';

const ApiTestScreen: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [results, setResults] = useState<Array<{ title: string; result: string }>>([]);

  const addResult = (title: string, result: string) => {
    setResults(prev => [...prev, { title, result }]);
  };

  const testApi = async (title: string, apiCall: () => Promise<any>) => {
    try {
      const response = await apiCall();
      addResult(title, JSON.stringify(response.data, null, 2));
    } catch (error: any) {
      addResult(title, `Error: ${error.message}`);
    }
  };

  // 테스트할 API 엔드포인트들
  const testEndpoints = [
    { title: '사용자 프로필 조회', call: () => apiClient.get('/api/users/profile') },
    { title: '감정 목록 조회', call: () => apiClient.get('/api/emotions') },
    { title: '내 게시물 조회', call: () => apiClient.get('/api/my-day/posts/me') },
    // 필요한 다른 엔드포인트 추가
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>API Test Screen</Text>
      <Text>인증 상태: {isAuthenticated ? '로그인됨' : '로그아웃'}</Text>
      {user && <Text>사용자: {user.username}</Text>}
      
      <View style={styles.buttonContainer}>
        {testEndpoints.map((endpoint, index) => (
          <Button
            key={index}
            title={endpoint.title}
            onPress={() => testApi(endpoint.title, endpoint.call)}
          />
        ))}
        <Button
          title="결과 초기화"
          onPress={() => setResults([])}
          color="#888"
        />
      </View>
      
      <ScrollView style={styles.results}>
        {results.map((item, index) => (
          <View key={index} style={styles.resultItem}>
            <Text style={styles.resultTitle}>{item.title}</Text>
            <Text style={styles.resultText}>{item.result}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5FCFF'
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10
  },
  buttonContainer: {
    marginVertical: 15,
    gap: 10
  },
  results: {
    flex: 1,
    marginTop: 10
  },
  resultItem: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#e9e9e9',
    borderRadius: 5
  },
  resultTitle: {
    fontWeight: 'bold',
    marginBottom: 5
  },
  resultText: {
    fontFamily: 'monospace'
  }
});

export default ApiTestScreen;