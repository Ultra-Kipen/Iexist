"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const comfortWallController_1 = __importDefault(require("../controllers/comfortWallController"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const validationMiddleware_1 = require("../middleware/validationMiddleware");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /comfort-wall:
 *   post:
 *     summary: 위로의 벽 게시물 작성
 *     tags: [ComfortWall]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authMiddleware_1.default, (0, validationMiddleware_1.validateRequest)([
    (0, express_validator_1.body)('content').isLength({ min: 20, max: 2000 })
        .withMessage('게시물 내용은 20자 이상 2000자 이하여야 합니다.'),
    (0, express_validator_1.body)('title').notEmpty()
        .withMessage('제목은 필수입니다.')
]), comfortWallController_1.default.createComfortWallPost);
/**
 * @swagger
 * /comfort-wall:
 *   get:
 *     summary: 위로의 벽 게시물 목록 조회
 *     tags: [ComfortWall]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authMiddleware_1.default, comfortWallController_1.default.getComfortWallPosts);
/**
 * @swagger
 * /comfort-wall/{id}/message:
 *   post:
 *     summary: 위로의 메시지 작성
 *     tags: [ComfortWall]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/message', authMiddleware_1.default, (0, validationMiddleware_1.validateRequest)([
    (0, express_validator_1.body)('message').isLength({ min: 5, max: 500 })
        .withMessage('위로의 메시지는 5자 이상 500자 이하여야 합니다.')
]), comfortWallController_1.default.createComfortMessage);
exports.default = router;
