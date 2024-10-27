"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const postController_1 = __importDefault(require("../controllers/postController"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const validationMiddleware_1 = require("../middleware/validationMiddleware");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /posts:
 *   post:
 *     summary: 게시물 작성
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authMiddleware_1.default, (0, validationMiddleware_1.validateRequest)([
    (0, express_validator_1.body)('content').isLength({ min: 10, max: 1000 })
        .withMessage('게시물 내용은 10자 이상 1000자 이하여야 합니다.'),
    (0, express_validator_1.body)('emotion_ids').optional().isArray()
        .withMessage('감정 ID 배열이 올바르지 않습니다.')
]), postController_1.default.createPost);
/**
 * @swagger
 * /posts:
 *   get:
 *     summary: 게시물 목록 조회
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authMiddleware_1.default, (0, validationMiddleware_1.validateRequest)([
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 50 })
]), postController_1.default.getPosts);
/**
 * @swagger
 * /posts/my:
 *   get:
 *     summary: 내 게시물 목록 조회
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 */
router.get('/my', authMiddleware_1.default, postController_1.default.getMyPosts);
/**
 * @swagger
 * /posts/{id}/comments:
 *   post:
 *     summary: 댓글 작성
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/comments', authMiddleware_1.default, (0, validationMiddleware_1.validateRequest)([
    (0, express_validator_1.body)('content').isLength({ min: 1, max: 300 })
        .withMessage('댓글 내용은 1자 이상 300자 이하여야 합니다.')
]), postController_1.default.createComment);
/**
 * @swagger
 * /posts/{id}/like:
 *   post:
 *     summary: 게시물 좋아요
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/like', authMiddleware_1.default, postController_1.default.likePost);
exports.default = router;
