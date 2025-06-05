// uploadService.test.ts
import uploadService from '../../../../src/services/api/uploadService';
import client from '../../../../src/services/api/client';
import { AxiosResponse } from 'axios';
// URL 모킹을 위한 타입 선언
interface MockURL {
    createObjectURL: jest.Mock;
    revokeObjectURL: jest.Mock;
  }
// 전역 FormData 모킹
class MockFormData {
    private data: { [key: string]: any } = {};
    
    append(key: string, value: any) {
      this.data[key] = value;
    }
  }
  
  // 전역 객체에 FormData 추가
  (global as any).FormData = MockFormData;
  
  jest.mock('../../../../src/services/api/client', () => ({
    post: jest.fn(),
    head: jest.fn()
  }));
describe('uploadService', () => {
    let originalURL: URL;
    let mockURL: MockURL;
    const mockFile = {
      uri: 'file:///mock/image.jpg',
      name: 'image.jpg',
      type: 'image/jpeg'
    };
    
    const mockResponse = {
      data: {
        image_url: 'https://example.com/uploads/image.jpg',
        original_name: 'image.jpg',
        file_size: 12345
      }
    };
    
    beforeEach(() => {
        originalURL = (global as any).URL;
         // URL 모킹
    mockURL = {
        createObjectURL: jest.fn().mockReturnValue('mock-url'),
        revokeObjectURL: jest.fn()
      };
  
      // @ts-ignore
      global.URL = mockURL;
      jest.clearAllMocks();
    });
    afterEach(() => {
        // 원본 URL 복원
        (global as any).URL = originalURL;
      });

  it('이미지 업로드 요청을 올바르게 보내야 함', async () => {
    // 모킹된 클라이언트 post 메서드 구현
    (client.post as jest.Mock).mockResolvedValueOnce(mockResponse);
    
    const result = await uploadService.uploadImage(mockFile.uri);
    
    // 클라이언트의 post 메서드가 올바른 인자로 호출되었는지 확인
    expect(client.post).toHaveBeenCalledWith(
      '/uploads/image',
      expect.any(MockFormData),
      expect.objectContaining({
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    );
    
    expect(result).toEqual(mockResponse);
  });

  it('업로드 실패 시 오류를 던져야 함', async () => {
    const mockError = new Error('업로드 실패');
    
    // 클라이언트의 post 메서드를 오류와 함께 모킹
    (client.post as jest.Mock).mockRejectedValueOnce(mockError);
    
    // 오류가 올바르게 전파되는지 확인
    await expect(uploadService.uploadImage(mockFile.uri)).rejects.toThrow('업로드 실패');
  });

   // 추가 테스트 케이스들
   it('파일 객체로 이미지 업로드가 가능해야 함', async () => {
    // File 생성 시 lastModified 추가
    const mockFileObject = new File(
      ['dummy content'], 
      'test.jpg', 
      { 
        type: 'image/jpeg', 
        lastModified: Date.now() 
      }
    );
    
    (client.post as jest.Mock).mockResolvedValueOnce(mockResponse);
    
    const result = await uploadService.uploadImage(mockFileObject);
    
    expect(client.post).toHaveBeenCalledWith(
      '/uploads/image',
      expect.any(MockFormData),
      expect.objectContaining({
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    );
    
    expect(result).toEqual(mockResponse);
  });


  it('진행 상태 콜백이 정상적으로 호출되어야 함', async () => {
    const mockProgressCallback = jest.fn();
    
    (client.post as jest.Mock).mockImplementation((url, data, config) => {
      // 모의 업로드 진행 이벤트 시뮬레이션
      if (config.onUploadProgress) {
        config.onUploadProgress({
          loaded: 50,
          total: 100
        });
      }
      return Promise.resolve(mockResponse);
    });
    
    await uploadService.uploadImage(mockFile.uri, mockProgressCallback);
    
    expect(mockProgressCallback).toHaveBeenCalledWith(50);
  });

  it('다중 이미지 업로드가 올바르게 작동해야 함', async () => {
    const mockFiles = [
      new File(
        ['dummy1'], 
        'test1.jpg', 
        { 
          type: 'image/jpeg', 
          lastModified: Date.now() 
        }
      ),
      new File(
        ['dummy2'], 
        'test2.jpg', 
        { 
          type: 'image/jpeg', 
          lastModified: Date.now() 
        }
      )
    ];
    
    (client.post as jest.Mock).mockResolvedValueOnce(mockResponse);
    
    const result = await uploadService.uploadMultipleImages(mockFiles);
    
    expect(client.post).toHaveBeenCalledWith(
      '/uploads/images',
      expect.any(MockFormData),
      expect.objectContaining({
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    );
    
    expect(result).toEqual(mockResponse);
  });

  it('프로필 이미지 업로드가 올바르게 작동해야 함', async () => {
    const mockProfileFile = new File(
      ['dummy profile'], 
      'profile.jpg', 
      { 
        type: 'image/jpeg', 
        lastModified: Date.now() 
      }
    );
    
    (client.post as jest.Mock).mockResolvedValueOnce(mockResponse);
    
    const result = await uploadService.uploadProfileImage(mockProfileFile);
    
    expect(client.post).toHaveBeenCalledWith(
      '/uploads/profile',
      expect.any(MockFormData),
      expect.objectContaining({
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    );
    
    expect(result).toEqual(mockResponse);
  });

  it('이미지 URL 검증이 올바르게 작동해야 함', async () => {
    const mockImageUrl = 'https://example.com/image.jpg';
    
    // 성공 케이스
    (client.head as jest.Mock) = jest.fn().mockResolvedValueOnce(undefined);
    const successResult = await uploadService.validateImageUrl(mockImageUrl);
    expect(successResult).toBe(true);
    
    // 실패 케이스
    (client.head as jest.Mock) = jest.fn().mockRejectedValueOnce(new Error('Not Found'));
    const failureResult = await uploadService.validateImageUrl(mockImageUrl);
    expect(failureResult).toBe(false);
  });

  it('임시 URL 생성 및 해제가 올바르게 작동해야 함', () => {
    // File 생성 시 lastModified 추가
    const mockFile = new File(
      ['dummy'], 
      'test.jpg', 
      { 
        type: 'image/jpeg', 
        lastModified: Date.now() 
      }
    );
    
    // URL 생성 테스트
    const createdUrl = uploadService.createObjectURL(mockFile);
    expect(createdUrl).toBe('mock-url');
    expect(mockURL.createObjectURL).toHaveBeenCalledWith(mockFile);
    
    // URL 해제 테스트
    uploadService.revokeObjectURL(createdUrl);
    expect(mockURL.revokeObjectURL).toHaveBeenCalledWith(createdUrl);
  });
});