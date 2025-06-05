import client from './client';
import { AxiosResponse } from 'axios';

interface UploadResponse {
  image_url: string;
  original_name: string;
  file_size: number;
}

const uploadService = {
  uploadImage: async (
    file: string | File, 
    onProgress?: (progress: number) => void
  ): Promise<AxiosResponse<UploadResponse>> => {
    // 파일 유효성 검사
    if (!file) {
      throw new Error('업로드할 파일이 없습니다.');
    }

    const formData = new FormData();
    
    // 파일 타입에 따른 처리
    if (typeof file === 'string') {
      // URI 문자열인 경우
      formData.append('file', {
        uri: file,
        name: file.split('/').pop() || 'image.jpg',
        type: 'image/jpeg'
      } as any);
    } else {
      // File 객체인 경우
      formData.append('file', file);
    }
    
    try {
      return await client.post<UploadResponse>('/uploads/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: onProgress ? (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total!
          );
          onProgress(percentCompleted);
        } : undefined
      });
    } catch (error) {
      // 오류를 그대로 던짐
      throw error;
    }
  },
  
  /**
   * 다중 이미지 업로드
   * @param files 업로드할 파일 배열
   * @param onProgress 진행 상태 콜백 (선택 사항)
   */
  uploadMultipleImages: async (files: File[], onProgress?: (progress: number) => void) => {
    const formData = new FormData();
    
    files.forEach((file) => {
      formData.append('images', file);
    });
    
    return client.post('/uploads/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: onProgress ? (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total!
        );
        onProgress(percentCompleted);
      } : undefined
    });
  },
  
  /**
   * 프로필 이미지 업로드
   * @param file 업로드할 파일
   * @param onProgress 진행 상태 콜백 (선택 사항)
   */
  uploadProfileImage: async (file: File, onProgress?: (progress: number) => void) => {
    const formData = new FormData();
    formData.append('profile_image', file);
    
    return client.post('/uploads/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: onProgress ? (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total!
        );
        onProgress(percentCompleted);
      } : undefined
    });
  },
  
  /**
   * 이미지 URL 검증 (존재하는지 확인)
   * @param imageUrl 확인할 이미지 URL
   */
  validateImageUrl: async (imageUrl: string) => {
    return client.head(imageUrl)
      .then(() => true)
      .catch(() => false);
  },
  
  /**
   * 업로드된 파일의 임시 URL 생성 (미리보기용)
   * @param file 파일 객체
   */
  createObjectURL: (file: File): string => {
    return URL.createObjectURL(file);
  },
  
  /**
   * 생성된 임시 URL 해제
   * @param url 해제할 URL
   */
  revokeObjectURL: (url: string): void => {
    URL.revokeObjectURL(url);
  }
};

export default uploadService;