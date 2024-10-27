"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const challengeController_1 = __importDefault(require("../controllers/challengeController"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const validationMiddleware_1 = require("../middleware/validationMiddleware");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /challenges:
 *   post:
 *     summary: 새로운 챌린지 생성
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authMiddleware_1.default, (0, validationMiddleware_1.validateRequest)([
    (0, express_validator_1.body)('title').isLength({ min: 5, max: 100 })
        .withMessage('제목은 5자 이상 100자 이하여야 합니다.'),
    (0, express_validator_1.body)('description').isLength({ min: 20, max: 500 })
        .withMessage('설명은 20자 이상 500자 이하여야 합니다.')
]), challengeController_1.default.createChallenge);
/**
 * @swagger
 * /challenges:
 *   get:
 *     summary: 챌린지 목록 조회
 *     tags: [Challenges]
 */
router.get('/', challengeController_1.default.getChallenges);
/**
 * @swagger
 * /challenges/{id}:
 *   get:
 *     summary: 특정 챌린지 상세 조회
 *     tags: [Challenges]
 */
router.get('/:id', challengeController_1.default.getChallenge);
/**
 * @swagger
 * /challenges/{id}/participate:
 *   post:
 *     summary: 챌린지 참여
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/participate', authMiddleware_1.default, challengeController_1.default.participateInChallenge);
/**
 * @swagger
 * /challenges/{id}/progress:
 *   post:
 *     summary: 챌린지 진행 상황 업데이트
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/progress', authMiddleware_1.default, (0, validationMiddleware_1.validateRequest)([
    (0, express_validator_1.body)('progress_note').isLength({ max: 500 })
        .withMessage('진행 상황 노트는 500자 이하여야 합니다.')
]), challengeController_1.default.updateChallengeProgress);
exports.default = router;
