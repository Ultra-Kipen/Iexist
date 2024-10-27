"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const statsController_1 = __importDefault(require("../controllers/statsController"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const router = (0, express_1.Router)();
/**
 * @swagger
 * /stats:
 *   get:
 *     summary: 사용자 통계 조회
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authMiddleware_1.default, statsController_1.default.getUserStats);
/**
 * @swagger
 * /stats:
 *   post:
 *     summary: 사용자 통계 업데이트
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 */
router.post('/update', authMiddleware_1.default, statsController_1.default.updateUserStats);
exports.default = router;
