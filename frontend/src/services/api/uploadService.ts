// services/api/uploadService.ts
import client from './client';

/**
 * 파일 업로드 API 서비스
 */
const uploadService = {
  /**
   * 단일 이미지 업로드
   * @param file 업로드할 파일
   * @param onProgress 진행 상태 콜백 (선택 사항)
   */
  uploadImage: async (file: File, onProgress?: (progress: number) => void) => {
    const formData = new FormData();
    formData.append('image', file);
    
    return client.post('/uploads/image', formData, {
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