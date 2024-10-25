"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const myDayController_1 = __importDefault(require("../controllers/myDayController"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const validationMiddleware_1 = require("../middleware/validationMiddleware");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /my-day:
 *   post:
 *     summary: 나의 하루 게시물 생성
 *     tags: [MyDay]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authMiddleware_1.default, (0, validationMiddleware_1.validateRequest)([
    (0, express_validator_1.body)('content').isLength({ min: 10, max: 1000 })
        .withMessage('내용은 10자 이상 1000자 이하여야 합니다.'),
    (0, express_validator_1.body)('emotion_ids').optional().isArray()
        .withMessage('감정 ID는 배열이어야 합니다.')
]), myDayController_1.default.createPost);
/**
 * @swagger
 * /my-day:
 *   get:
 *     summary: 나의 하루 게시물 목록 조회
 *     tags: [MyDay]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authMiddleware_1.default, myDayController_1.default.getPosts);
/**
 * @swagger
 * /my-day/{id}/comments:
 *   post:
 *     summary: 게시물에 댓글 작성
 *     tags: [MyDay]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/comments', authMiddleware_1.default, (0, validationMiddleware_1.validateRequest)([
    (0, express_validator_1.body)('content').isLength({ min: 1, max: 300 })
        .withMessage('댓글은 1자 이상 300자 이하여야 합니다.')
]), myDayController_1.default.createComment);
/**
 * @swagger
 * /my-day/{id}/like:
 *   post:
 *     summary: 게시물 좋아요/좋아요 취소
 *     tags: [MyDay]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/like', authMiddleware_1.default, myDayController_1.default.likePost);
exports.default = router;
