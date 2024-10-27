"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validationMiddleware_1 = require("../middleware/validationMiddleware");
const express_validator_1 = require("express-validator");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const models_1 = __importDefault(require("../models"));
const router = (0, express_1.Router)();
// 컨트롤러 함수들을 라우터 파일 내에서 정의
const userController = {
    // 회원가입
    register: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { username, email, password, nickname } = req.body;
            const existingUser = yield models_1.default.User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ message: '이미 사용 중인 이메일입니다.' });
            }
            const hashedPassword = yield bcryptjs_1.default.hash(password, 12);
            const newUser = yield models_1.default.User.create({
                username,
                email,
                password_hash: hashedPassword,
                nickname: nickname || username,
                theme_preference: 'light'
            });
            const token = jsonwebtoken_1.default.sign({ userId: newUser.user_id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
            res.status(201).json({
                message: '회원가입이 완료되었습니다.',
                token,
                user: {
                    id: newUser.user_id,
                    username: newUser.username,
                    email: newUser.email,
                    nickname: newUser.nickname
                }
            });
        }
        catch (error) {
            console.error('회원가입 오류:', error);
            res.status(500).json({ message: '회원가입 중 오류가 발생했습니다.' });
        }
    }),
    // 로그인
    login: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { email, password } = req.body;
            const user = yield models_1.default.User.findOne({ where: { email } });
            if (!user) {
                return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
            }
            const isPasswordValid = yield bcryptjs_1.default.compare(password, user.password_hash);
            if (!isPasswordValid) {
                return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
            }
            const token = jsonwebtoken_1.default.sign({ userId: user.user_id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
            res.json({
                message: '로그인 성공',
                token,
                user: {
                    id: user.user_id,
                    username: user.username,
                    email: user.email,
                    nickname: user.nickname
                }
            });
        }
        catch (error) {
            console.error('로그인 오류:', error);
            res.status(500).json({ message: '로그인 중 오류가 발생했습니다.' });
        }
    }),
    // 프로필 조회
    getProfile: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const user = yield models_1.default.User.findByPk(userId, {
                attributes: { exclude: ['password_hash'] }
            });
            if (!user) {
                return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
            }
            res.json(user);
        }
        catch (error) {
            console.error('프로필 조회 오류:', error);
            res.status(500).json({ message: '프로필 조회 중 오류가 발생했습니다.' });
        }
    }),
    // 프로필 수정
    updateProfile: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const { nickname, theme_preference, favorite_quote } = req.body;
            yield models_1.default.User.update({ nickname, theme_preference, favorite_quote }, { where: { user_id: userId } });
            res.json({ message: '프로필이 성공적으로 수정되었습니다.' });
        }
        catch (error) {
            console.error('프로필 수정 오류:', error);
            res.status(500).json({ message: '프로필 수정 중 오류가 발생했습니다.' });
        }
    })
};
// 라우트 정의
router.post('/register', (0, validationMiddleware_1.validateRequest)([
    (0, express_validator_1.body)('username').notEmpty().withMessage('사용자 이름은 필수입니다.'),
    (0, express_validator_1.body)('email').isEmail().withMessage('유효한 이메일을 입력해주세요.'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('비밀번호는 최소 6자 이상이어야 합니다.')
]), userController.register);
router.post('/login', (0, validationMiddleware_1.validateRequest)([
    (0, express_validator_1.body)('email').isEmail().withMessage('유효한 이메일을 입력해주세요.'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('비밀번호를 입력해주세요.')
]), userController.login);
router.get('/profile', authMiddleware_1.default, userController.getProfile);
router.put('/profile', authMiddleware_1.default, (0, validationMiddleware_1.validateRequest)([
    (0, express_validator_1.body)('nickname').optional().isLength({ min: 2, max: 50 })
        .withMessage('닉네임은 2자 이상 50자 이하여야 합니다.'),
    (0, express_validator_1.body)('theme_preference').optional().isIn(['light', 'dark', 'system'])
        .withMessage('유효하지 않은 테마 설정입니다.')
]), userController.updateProfile);
exports.default = router;
