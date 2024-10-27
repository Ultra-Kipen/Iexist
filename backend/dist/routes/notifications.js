"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notificationController_1 = __importDefault(require("../controllers/notificationController"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const router = (0, express_1.Router)();
/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: 알림 목록 조회
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authMiddleware_1.default, notificationController_1.default.getNotifications);
/**
 * @swagger
 * /notifications/{id}/read:
 *   post:
 *     summary: 알림 읽음 처리
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/read', authMiddleware_1.default, notificationController_1.default.markNotificationAsRead);
/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     summary: 알림 삭제
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authMiddleware_1.default, notificationController_1.default.deleteNotification);
exports.default = router;
