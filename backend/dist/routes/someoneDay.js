"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const someoneDayController_1 = __importDefault(require("../controllers/someoneDayController"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const validationMiddleware_1 = require("../middleware/validationMiddleware");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /someone-day:
 *   post:
 *     summary: 누군가의 하루 게시물 생성
 *     tags: [SomeoneDay]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authMiddleware_1.default, (0, validationMiddleware_1.validateRequest)([
    (0, express_validator_1.body)('title').notEmpty().withMessage('제목은 필수입니다.'),
    (0, express_validator_1.body)('content').isLength({ min: 20, max: 2000 })
        .withMessage('내용은 20자 이상 2000자 이하여야 합니다.')
]), someoneDayController_1.default.createPost);
/**
 * @swagger
 * /someone-day:
 *   get:
 *     summary: 누군가의 하루 게시물 목록 조회
 *     tags: [SomeoneDay]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authMiddleware_1.default, someoneDayController_1.default.getPosts);
/**
 * @swagger
 * /someone-day/popular:
 *   get:
 *     summary: 인기 게시물 조회
 *     tags: [SomeoneDay]
 */
router.get('/popular', someoneDayController_1.default.getPopularPosts);
/**
 * @swagger
 * /someone-day/{id}/report:
 *   post:
 *     summary: 게시물 신고
 *     tags: [SomeoneDay]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/report', authMiddleware_1.default, (0, validationMiddleware_1.validateRequest)([
    (0, express_validator_1.body)('reason').isLength({ min: 5, max: 200 })
        .withMessage('신고 사유는 5자 이상 200자 이하여야 합니다.')
]), someoneDayController_1.default.reportPost);
exports.default = router;
