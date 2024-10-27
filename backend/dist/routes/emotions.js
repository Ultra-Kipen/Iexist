"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const emotionController_1 = __importDefault(require("../controllers/emotionController"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const validationMiddleware_1 = require("../middleware/validationMiddleware");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /emotions/log:
 *   post:
 *     summary: 감정 기록 생성
 *     tags: [Emotions]
 *     security:
 *       - bearerAuth: []
 */
router.post('/log', authMiddleware_1.default, (0, validationMiddleware_1.validateRequest)([
    (0, express_validator_1.body)('emotion_ids').isArray().withMessage('감정 ID 배열이 필요합니다.'),
    (0, express_validator_1.body)('emotion_ids.*').isInt().withMessage('감정 ID는 정수여야 합니다.'),
    (0, express_validator_1.body)('note').optional().isString().withMessage('노트는 문자열이어야 합니다.')
]), emotionController_1.default.createEmotion);
/**
 * @swagger
 * /emotions/logs:
 *   get:
 *     summary: 감정 로그 조회
 *     tags: [Emotions]
 *     security:
 *       - bearerAuth: []
 */
router.get('/logs', authMiddleware_1.default, (0, validationMiddleware_1.validateRequest)([
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 })
]), emotionController_1.default.getEmotions);
/**
 * @swagger
 * /emotions/stats:
 *   get:
 *     summary: 감정 통계 조회
 *     tags: [Emotions]
 *     security:
 *       - bearerAuth: []
 */
router.get('/stats', authMiddleware_1.default, emotionController_1.default.getEmotionStats);
/**
 * @swagger
 * /emotions/trend:
 *   get:
 *     summary: 감정 추세 조회
 *     tags: [Emotions]
 *     security:
 *       - bearerAuth: []
 */
router.get('/trend', authMiddleware_1.default, (0, validationMiddleware_1.validateRequest)([
    (0, express_validator_1.query)('start_date').isDate(),
    (0, express_validator_1.query)('end_date').isDate()
]), emotionController_1.default.getEmotionTrend);
/**
 * @swagger
 * /emotions/daily-check:
 *   get:
 *     summary: 일일 감정 체크 확인
 *     tags: [Emotions]
 *     security:
 *       - bearerAuth: []
 */
router.get('/daily-check', authMiddleware_1.default, emotionController_1.default.getDailyEmotionCheck);
/**
 * @swagger
 * /emotions:
 *   get:
 *     summary: 모든 감정 목록 조회
 *     tags: [Emotions]
 */
router.get('/', emotionController_1.default.getAllEmotions);
exports.default = router;
