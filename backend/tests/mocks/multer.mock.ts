// tests/mocks/multer.mock.ts
import fs from 'fs';
import path from 'path';

// Multer 모킹 함수
export const mockMulter = {
  single: (fieldName: string) => {
    return (req: any, res: any, next: any) => {
      const testFile = {
        fieldname: fieldName,
        originalname: 'test-image.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        destination: path.join(__dirname, '../../uploads/temp'),
        filename: `${Date.now()}-test-image.jpg`,
        path: path.join(__dirname, '../../uploads/temp', `${Date.now()}-test-image.jpg`),
        size: 1024 // 1KB
      };
      
      // 테스트 파일 생성
      const dir = path.dirname(testFile.path);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(testFile.path, Buffer.from('test file content'));
      
      req.file = testFile;
      next();
    };
  },
  
  array: (fieldName: string, maxCount: number) => {
    return (req: any, res: any, next: any) => {
      const testFiles = Array(2).fill(0).map((_, i) => ({
        fieldname: fieldName,
        originalname: `test-image-${i}.jpg`,
        encoding: '7bit',
        mimetype: 'image/jpeg',
        destination: path.join(__dirname, '../../uploads/temp'),
        filename: `${Date.now()}-test-image-${i}.jpg`,
        path: path.join(__dirname, '../../uploads/temp', `${Date.now()}-test-image-${i}.jpg`),
        size: 1024 // 1KB
      }));
      
      // 테스트 파일 생성
      for (const file of testFiles) {
        const dir = path.dirname(file.path);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(file.path, Buffer.from(`test file content ${file.originalname}`));
      }
      
      req.files = testFiles;
      next();
    };
  }
};

export default mockMulter;