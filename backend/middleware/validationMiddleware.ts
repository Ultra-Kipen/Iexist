import { Request, Response, NextFunction } from 'express';
import { ValidationChain, validationResult, query, body, param } from 'express-validator';

// Validation 결과를 처리하는 미들웨어
export const validateRequest = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 모든 validation 규칙 실행
      await Promise.all(validations.map(validation => validation.run(req)));

      const errors = validationResult(req);
      if (errors.isEmpty()) {
        return next();
      }

      // 에러 응답 형식 통일
      return res.status(400).json({
        success: false,
        errors: errors.array().map(error => ({
          field: error.type === 'field' ? error.path : 'general',
          message: error.msg
        }))
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        errors: [{
          field: 'server',
          message: '서버 오류가 발생했습니다.'
        }]
      });
    }
  };
};

// express-validator의 기본 함수들 export
export { query, body, param };

// 공통 validation 규칙
export const commonValidations = {
  // 페이지네이션 validation 규칙
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('페이지 번호는 1 이상이어야 합니다.'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('한 페이지당 1~50개의 항목을 조회할 수 있습니다.')
  ],

  // 날짜 범위 validation 규칙
  dateRange: [
    query('start_date')
      .isISO8601()
      .withMessage('시작 날짜는 유효한 날짜 형식이어야 합니다.'),
    query('end_date')
      .isISO8601()
      .withMessage('종료 날짜는 유효한 날짜 형식이어야 합니다.')
  ],

  // 감정 ID 배열 validation 규칙
  emotionIds: [
    body('emotion_ids')
      .isArray()
      .withMessage('감정 ID 배열이 필요합니다.'),
    body('emotion_ids.*')
      .isInt({ min: 1 })
      .withMessage('감정 ID는 1 이상의 정수여야 합니다.')
  ],

  // ID 파라미터 validation 규칙
  paramId: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('유효한 ID가 아닙니다.')
  ]
};

// 사용자 관련 validation 규칙
export const userValidations = {
  register: [
    body('username')
      .notEmpty()
      .withMessage('사용자 이름은 필수입니다.')
      .isLength({ min: 2, max: 30 })
      .withMessage('사용자 이름은 2자 이상 30자 이하여야 합니다.'),
    body('email')
      .isEmail()
      .withMessage('유효한 이메일을 입력해주세요.')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('비밀번호는 최소 6자 이상이어야 합니다.')
  ],

  login: [
    body('email')
      .isEmail()
      .withMessage('유효한 이메일을 입력해주세요.')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('비밀번호를 입력해주세요.')
  ]
};

// 게시물 관련 validation 규칙
export const postValidations = {
  create: [
    body('content')
      .isLength({ min: 10, max: 1000 })
      .withMessage('게시물 내용은 10자 이상 1000자 이하여야 합니다.'),
    body('emotion_ids')
      .optional()
      .isArray()
      .withMessage('감정 ID 배열이 올바르지 않습니다.'),
    body('emotion_summary')
      .optional()
      .isString()
      .isLength({ max: 100 })
      .withMessage('감정 요약은 100자를 초과할 수 없습니다.')
  ]
};

export default validateRequest;