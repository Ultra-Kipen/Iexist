// src/services/api/tagService.ts

import apiClient from './client';

export interface Tag {
  tag_id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface TagWithCount extends Tag {
  post_count: number;
}

const tagService = {
  // 모든 태그 가져오기
  getAllTags: async () => {
    return await apiClient.get<{
      status: string;
      data: Tag[];
    }>('/tags');
  },
  
  // 인기 태그 가져오기 (사용 횟수 기준)
  getPopularTags: async (limit: number = 10) => {
    return await apiClient.get<{
      status: string;
      data: TagWithCount[];
    }>('/tags/popular', { params: { limit } });
  },
  
  // 태그 생성하기
  createTag: async (name: string) => {
    return await apiClient.post<{
      status: string;
      data: Tag;
    }>('/tags', { name });
  },
  
  // 특정 태그 정보 가져오기
  getTagById: async (tagId: number) => {
    return await apiClient.get<{
      status: string;
      data: Tag;
    }>(`/tags/${tagId}`);
  },
  
  // 태그 수정하기
  updateTag: async (tagId: number, name: string) => {
    return await apiClient.put<{
      status: string;
      message: string;
    }>(`/tags/${tagId}`, { name });
  },
  
  // 태그 삭제하기
  deleteTag: async (tagId: number) => {
    return await apiClient.delete<{
      status: string;
      message: string;
    }>(`/tags/${tagId}`);
  },
  
  // 태그로 게시물 검색하기
  getPostsByTag: async (tagId: number, params?: {
    page?: number;
    limit?: number;
    post_type?: 'my_day' | 'someone_day';
  }) => {
    return await apiClient.get<{
      status: string;
      data: any[]; // 실제 반환 타입에 맞게 조정 필요
      pagination?: {
        total: number;
        page: number;
        limit: number;
      }
    }>(`/tags/${tagId}/posts`, { params });
  },
  
  // 태그 검색하기 (이름으로)
  searchTags: async (query: string) => {
    return await apiClient.get<{
      status: string;
      data: Tag[];
    }>('/tags/search', { params: { query } });
  },
  
  // 특정 게시물에 태그 추가하기
  addTagToPost: async (postId: number, tagId: number, postType: 'my_day' | 'someone_day') => {
    return await apiClient.post<{
      status: string;
      message: string;
    }>(`/posts/${postId}/tags`, { tag_id: tagId, post_type: postType });
  },
  
  // 특정 게시물에서 태그 제거하기
  removeTagFromPost: async (postId: number, tagId: number, postType: 'my_day' | 'someone_day') => {
    return await apiClient.delete<{
      status: string;
      message: string;
    }>(`/posts/${postId}/tags/${tagId}?post_type=${postType}`);
  },
  
  // 특정 게시물의 모든 태그 가져오기
  getPostTags: async (postId: number, postType: 'my_day' | 'someone_day') => {
    return await apiClient.get<{
      status: string;
      data: Tag[];
    }>(`/posts/${postId}/tags?post_type=${postType}`);
  }
};

export default tagService;