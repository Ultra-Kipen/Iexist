// __tests__/mocks/MockScreens.tsx
import React, { useEffect } from 'react';
import { View, Text, Button, TextInput } from 'react-native';
import postService from '../../src/services/api/postService';

// Mock PostScreen 컴포넌트
export const MockPostScreen = ({ route, navigation }: any) => {
  const { postId } = route?.params || { postId: 1 };
  
  useEffect(() => {
    // 게시물 상세 정보 로드 (getPostById 메서드 사용)
    postService.getPostById(postId);
    // 댓글 로드
    postService.getComments(postId);
  }, [postId]);

  const handleAddComment = () => {
    postService.addComment(postId, { content: '테스트 댓글입니다.', is_anonymous: false });
  };

  return (
    <View>
      <Text>게시물 상세 화면</Text>
      <Text>게시물 ID: {postId}</Text>
      <Text>테스트 게시물</Text>
      <Text>너무 좋네요!</Text>
      
      <TextInput 
        placeholder="댓글을 입력하세요..." 
        testID="comment-input"
      />
      
      <Button 
        title="게시" 
        onPress={handleAddComment}
        testID="submit-comment"
      />
    </View>
  );
};

// Mock MyPostsScreen 컴포넌트
export const MockMyPostsScreen = ({ navigation }: any) => {
  useEffect(() => {
    // 내 게시물 로드
    postService.getMyPosts();
  }, []);

  const handleDeletePost = (postId: number) => {
    postService.deletePost(postId);
  };

  return (
    <View>
      <Text>내 게시물 화면</Text>
      <View testID="post-item">
        <Text>게시물 1</Text>
        <Button 
          title="삭제" 
          onPress={() => handleDeletePost(1)}
          testID="delete-button"
        />
      </View>
      <Button
        title="새로고침"
        onPress={() => postService.getMyPosts()}
        testID="refresh-button"
      />
    </View>
  );
};

// Mock StatisticsScreen 컴포넌트
export const MockStatisticsScreen = ({ navigation }: any) => {
  return (
    <View>
      <Text>감정 통계</Text>
      <View testID="emotion-chart">
        <Text>그래프 영역</Text>
      </View>
      <Button
        title="주간"
        onPress={() => {}}
        testID="weekly-button"
      />
      <Text>주간 감정 통계</Text>
    </View>
  );
};