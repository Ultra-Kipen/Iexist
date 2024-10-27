import { Request, Response, NextFunction } from 'express';
import { ValidationChain, validationResult, ValidationError } from 'express-validator';

interface FormattedError {
  field: string;
  value: any;
  message: string;
  location: string;
}

export const validateRequest = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const formattedErrors = errors.array().map((err: ValidationError) => ({
      field: err.type === 'field' ? err.path : '',
      value: err.type === 'field' ? err.value : '',
      message: err.msg,
      location: err.type === 'field' ? err.location : ''
    }));

    res.status(400).json({
      message: '입력값이 올바르지 않습니다.',
      errors: formattedErrors
    });
  };
};