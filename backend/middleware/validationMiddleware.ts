import { Request, Response, NextFunction } from 'express';
const expressValidator = require('express-validator');

const { check, validationResult } = expressValidator;

// ValidationRule 타입 정의
type ValidationRule = {
  run: (req: Request) => Promise<any>;
  field?: string;
  type?: string;
};

interface ValidationError {
  type: string;
  value: string;
  msg: string;
  path: string;
  location: string;
}

type CustomValidator = ValidationRule & {
  optional: () => CustomValidator;
  isInt: (options?: { min?: number; max?: number }) => CustomValidator;
  isIn: (values: any[]) => CustomValidator;
  isISO8601: () => CustomValidator;
  isArray: () => CustomValidator;
  isString: () => CustomValidator;
  isLength: (options: { min?: number; max?: number }) => CustomValidator;
  withMessage: (message: string) => CustomValidator;
  notEmpty: () => CustomValidator;
  isEmail: () => CustomValidator;
  normalizeEmail: () => CustomValidator;
  isBoolean: () => CustomValidator;
  toInt: () => CustomValidator;
  trim: () => CustomValidator;
  matches: (pattern: RegExp) => CustomValidator;  // 추가된 부분
  field: string;
  type: string;
};
// validation 함수 타입 정의
export const body = (field: string): CustomValidator => check(field) as CustomValidator;
export const param = (field: string): CustomValidator => check(field) as CustomValidator;
export const query = (field: string): CustomValidator => check(field) as CustomValidator;

// validateRequest 함수 정의
export const validateRequest = (validations: ValidationRule[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await Promise.all(
        validations.map(validation => validation.run(req))
      );

      const errors = validationResult(req);
      if (errors.isEmpty()) {
        return next();
      }

      const errorArray = errors.array() as ValidationError[];
      
      return res.status(400).json({
        success: false,
        errors: errorArray.map((error: ValidationError) => ({
          field: error.type === 'field' ? error.path : 'general',
          message: error.msg
        }))
      });

    } catch (error) {
      return res.status(500).json({    // 여기 오류 수정
        success: false,
        errors: [{                      // isInt 제거
          field: 'server',
          message: '서버 오류가 발생했습니다.'
        }]
      });
    }
  };
};

// 공통 validation 규칙들
export const commonValidations = {
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('페이지 번호는 1 이상이어야 합니다.'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('한 페이지당 1~50개의 항목을 조회할 수 있습니다.')
  ] as CustomValidator[],

  dateRange: [
    query('start_date')
      .isISO8601()
      .withMessage('시작 날짜는 유효한 날짜 형식이어야 합니다.'),
    query('end_date')
      .isISO8601()
      .withMessage('종료 날짜는 유효한 날짜 형식이어야 합니다.')
  ] as CustomValidator[],

  emotionIds: [
    body('emotion_ids')
      .isArray()
      .withMessage('감정 ID 배열이 필요합니다.'),
    body('emotion_ids.*')
      .isInt({ min: 1 })
      .withMessage('감정 ID는 1 이상의 정수여야 합니다.')
  ] as CustomValidator[],

  paramId: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('유효한 ID가 아닙니다.')
  ] as CustomValidator[]
};

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
    .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/)
    .withMessage('비밀번호는 영문과 숫자를 포함하여 6자 이상이어야 합니다.')
  ] as CustomValidator[],

  login: [
    body('email')
      .isEmail()
      .withMessage('유효한 이메일을 입력해주세요.')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('비밀번호를 입력해주세요.')
  ] as CustomValidator[]
};

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
  ] as CustomValidator[]
};

export default validateRequest;