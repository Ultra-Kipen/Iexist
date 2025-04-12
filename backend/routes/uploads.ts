// routes/uploads.ts
import { NextFunction, Request, Response, Router } from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { uploadImage, uploadMultipleImages, uploadProfileImage } from '../controllers/uploadController';
import authMiddleware from '../middleware/authMiddleware';

const router = Router();

// 업로드 디렉토리 설정
const UPLOAD_DIR = path.join(__dirname, '../uploads');
const TEMP_DIR = path.join(UPLOAD_DIR, 'temp');
const PROFILE_DIR = path.join(UPLOAD_DIR, 'profiles');

// 디렉토리가 없으면 생성
[UPLOAD_DIR, TEMP_DIR, PROFILE_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// multer 에러 핸들러 미들웨어
export const handleMulterError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err) {
    console.error('파일 업로드 오류:', err);

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          status: 'error',
          message: '파일 크기가 제한을 초과했습니다.'
        });
      } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          status: 'error',
          message: '예상치 못한 필드명의 파일입니다.'
        });
      } else {
        return res.status(400).json({
          status: 'error',
          message: `파일 업로드 오류: ${err.message}`
        });
      }
    } else {
      return res.status(400).json({
        status: 'error',
        message: err.message || '파일 업로드 중 오류가 발생했습니다.'
      });
    }
  }
  
  next();
};

// 파일 확장자 검증 함수
const isValidImageExtension = (filename: string): boolean => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const ext = path.extname(filename).toLowerCase();
  return allowedExtensions.includes(ext);
};

// 파일 필터 함수
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (!isValidImageExtension(file.originalname)) {
    return cb(new Error('허용되지 않는 파일 형식입니다. jpg, jpeg, png, gif, webp 형식만 업로드 가능합니다.'));
  }
  cb(null, true);
};

// 이미지 업로드용 multer 설정
const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, TEMP_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// 프로필 이미지 업로드용 multer 설정
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, TEMP_DIR);  // 임시 디렉토리에 저장 후 컨트롤러에서 최종 위치로 이동
  },
  filename: (req, file, cb) => {
    cb(null, `profile-${Date.now()}-${file.originalname}`);
  }
});

// 이미지 업로드용 multer 인스턴스
const uploadConfig = multer({
  storage: uploadStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter
});
// 프로필 이미지 업로드용 multer 인스턴스
const profileUploadConfig = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter
});

// 프로필 이미지 업로드 처리 미들웨어 - users.ts에서 사용
export const handleProfileImageUpload = profileUploadConfig.single('profile_image');

// 단일 이미지 업로드 라우트
router.post('/image', 
  authMiddleware, 
  uploadConfig.single('image'), 
  handleMulterError,
  uploadImage
);

// 다중 이미지 업로드 라우트
router.post('/images', 
  authMiddleware, 
  uploadConfig.array('images', 10),  // 최대 10개 파일
  handleMulterError,
  uploadMultipleImages
);

// 프로필 이미지 업로드 라우트
router.post('/profile', 
  authMiddleware, 
  profileUploadConfig.single('profile_image'),
  handleMulterError,
  uploadProfileImage
);

export default router;