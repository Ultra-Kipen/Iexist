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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sequelize_1 = require("sequelize");
const models_1 = __importDefault(require("../models"));
const userController = {
    register: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const transaction = yield models_1.default.sequelize.transaction();
        try {
            const { username, email, password, nickname } = req.body;
            // Validation
            if (!username || username.length < 4 || username.length > 20) {
                yield transaction.rollback();
                return res.status(400).json({
                    status: 'error',
                    message: '사용자 이름은 4-20자 사이여야 합니다.'
                });
            }
            if (!email || !email.includes('@') || !email.includes('.')) {
                yield transaction.rollback();
                return res.status(400).json({
                    status: 'error',
                    message: '유효한 이메일 주소를 입력해주세요.'
                });
            }
            if (!password || password.length < 8) {
                yield transaction.rollback();
                return res.status(400).json({
                    status: 'error',
                    message: '비밀번호는 최소 8자 이상이어야 합니다.'
                });
            }
            // Duplicate checks
            const [existingUser, existingUsername] = yield Promise.all([
                models_1.default.User.findOne({ where: { email }, transaction }),
                models_1.default.User.findOne({ where: { username }, transaction })
            ]);
            if (existingUser) {
                yield transaction.rollback();
                return res.status(400).json({
                    status: 'error',
                    message: '이미 사용 중인 이메일입니다.'
                });
            }
            if (existingUsername) {
                yield transaction.rollback();
                return res.status(400).json({
                    status: 'error',
                    message: '이미 사용 중인 사용자 이름입니다.'
                });
            }
            const hashedPassword = yield bcryptjs_1.default.hash(password, 12);
            const newUser = yield models_1.default.User.create({
                username,
                email,
                password_hash: hashedPassword,
                nickname: nickname || username,
                theme_preference: 'system',
                privacy_settings: {
                    profile_visibility: 'public',
                    post_visibility: 'public',
                    emotion_visibility: 'public'
                }
            }, { transaction });
            // Create initial user stats
            yield models_1.default.UserStats.create({
                user_id: newUser.user_id
            }, { transaction });
            const token = jsonwebtoken_1.default.sign({ userId: newUser.user_id }, process.env.JWT_SECRET, { expiresIn: '24h' });
            yield transaction.commit();
            res.status(201).json({
                status: 'success',
                message: '회원가입이 완료되었습니다.',
                data: {
                    token,
                    user: {
                        id: newUser.user_id,
                        username: newUser.username,
                        email: newUser.email,
                        nickname: newUser.nickname,
                        theme_preference: newUser.theme_preference
                    }
                }
            });
        }
        catch (error) {
            yield transaction.rollback();
            console.error('회원가입 오류:', error);
            res.status(500).json({
                status: 'error',
                message: '회원가입 중 오류가 발생했습니다.'
            });
        }
    }),
    login: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({
                    status: 'error',
                    message: '이메일과 비밀번호를 입력해주세요.'
                });
            }
            const user = yield models_1.default.User.findOne({
                where: { email },
                attributes: [
                    'user_id',
                    'username',
                    'email',
                    'password_hash',
                    'nickname',
                    'theme_preference',
                    'privacy_settings'
                ]
            });
            if (!user || !(yield bcryptjs_1.default.compare(password, user.password_hash))) {
                return res.status(401).json({
                    status: 'error',
                    message: '이메일 또는 비밀번호가 올바르지 않습니다.'
                });
            }
            const token = jsonwebtoken_1.default.sign({ userId: user.user_id }, process.env.JWT_SECRET, { expiresIn: '24h' });
            // Update last login time
            yield user.update({
                last_login_at: new Date()
            });
            res.json({
                status: 'success',
                message: '로그인에 성공했습니다.',
                data: {
                    token,
                    user: {
                        id: user.user_id,
                        username: user.username,
                        email: user.email,
                        nickname: user.nickname,
                        theme_preference: user.theme_preference,
                        privacy_settings: user.privacy_settings
                    }
                }
            });
        }
        catch (error) {
            console.error('로그인 오류:', error);
            res.status(500).json({
                status: 'error',
                message: '로그인 중 오류가 발생했습니다.'
            });
        }
    }),
    getProfile: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const user_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!user_id) {
                return res.status(401).json({
                    status: 'error',
                    message: '인증이 필요합니다.'
                });
            }
            const user = yield models_1.default.User.findByPk(user_id, {
                attributes: {
                    exclude: ['password_hash', 'reset_token', 'reset_token_expiry']
                },
                include: [{
                        model: models_1.default.UserStats,
                        attributes: [
                            'my_day_post_count',
                            'someone_day_post_count',
                            'my_day_like_received_count',
                            'someone_day_like_received_count'
                        ]
                    }]
            });
            if (!user) {
                return res.status(404).json({
                    status: 'error',
                    message: '사용자를 찾을 수 없습니다.'
                });
            }
            res.json({
                status: 'success',
                data: { user }
            });
        }
        catch (error) {
            console.error('프로필 조회 오류:', error);
            res.status(500).json({
                status: 'error',
                message: '프로필 조회 중 오류가 발생했습니다.'
            });
        }
    }),
    updateProfile: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const transaction = yield models_1.default.sequelize.transaction();
        try {
            const user_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const updateData = req.body;
            if (!user_id) {
                yield transaction.rollback();
                return res.status(401).json({
                    status: 'error',
                    message: '인증이 필요합니다.'
                });
            }
            if (updateData.nickname && (updateData.nickname.length < 2 || updateData.nickname.length > 20)) {
                yield transaction.rollback();
                return res.status(400).json({
                    status: 'error',
                    message: '닉네임은 2-20자 사이여야 합니다.'
                });
            }
            const user = yield models_1.default.User.findByPk(user_id, { transaction });
            if (!user) {
                yield transaction.rollback();
                return res.status(404).json({
                    status: 'error',
                    message: '사용자를 찾을 수 없습니다.'
                });
            }
            yield user.update(updateData, { transaction });
            yield transaction.commit();
            res.json({
                status: 'success',
                message: '프로필이 성공적으로 업데이트되었습니다.',
                data: {
                    user: {
                        id: user.user_id,
                        username: user.username,
                        nickname: user.nickname,
                        theme_preference: user.theme_preference,
                        privacy_settings: user.privacy_settings
                    }
                }
            });
        }
        catch (error) {
            yield transaction.rollback();
            console.error('프로필 업데이트 오류:', error);
            res.status(500).json({
                status: 'error',
                message: '프로필 업데이트 중 오류가 발생했습니다.'
            });
        }
    }),
    updatePassword: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const transaction = yield models_1.default.sequelize.transaction();
        try {
            const user_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const { current_password, new_password } = req.body;
            if (!user_id) {
                yield transaction.rollback();
                return res.status(401).json({
                    status: 'error',
                    message: '인증이 필요합니다.'
                });
            }
            if (!new_password || new_password.length < 8) {
                yield transaction.rollback();
                return res.status(400).json({
                    status: 'error',
                    message: '새 비밀번호는 최소 8자 이상이어야 합니다.'
                });
            }
            const user = yield models_1.default.User.findByPk(user_id, { transaction });
            if (!user) {
                yield transaction.rollback();
                return res.status(404).json({
                    status: 'error',
                    message: '사용자를 찾을 수 없습니다.'
                });
            }
            const isPasswordValid = yield bcryptjs_1.default.compare(current_password, user.password_hash);
            if (!isPasswordValid) {
                yield transaction.rollback();
                return res.status(401).json({
                    status: 'error',
                    message: '현재 비밀번호가 올바르지 않습니다.'
                });
            }
            const hashedPassword = yield bcryptjs_1.default.hash(new_password, 12);
            yield user.update({ password_hash: hashedPassword }, { transaction });
            yield transaction.commit();
            res.json({
                status: 'success',
                message: '비밀번호가 성공적으로 변경되었습니다.'
            });
        }
        catch (error) {
            yield transaction.rollback();
            console.error('비밀번호 변경 오류:', error);
            res.status(500).json({
                status: 'error',
                message: '비밀번호 변경 중 오류가 발생했습니다.'
            });
        }
    }),
    resetPassword: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const transaction = yield models_1.default.sequelize.transaction();
        try {
            const { token, new_password } = req.body;
            if (!new_password || new_password.length < 8) {
                yield transaction.rollback();
                return res.status(400).json({
                    status: 'error',
                    message: '새 비밀번호는 최소 8자 이상이어야 합니다.'
                });
            }
            const user = yield models_1.default.User.findOne({
                where: {
                    reset_token: token,
                    reset_token_expiry: { [sequelize_1.Op.gt]: new Date() }
                },
                transaction
            });
            if (!user) {
                yield transaction.rollback();
                return res.status(400).json({
                    status: 'error',
                    message: '유효하지 않거나 만료된 토큰입니다.'
                });
            }
            const hashedPassword = yield bcryptjs_1.default.hash(new_password, 12);
            yield user.update({
                password_hash: hashedPassword,
                reset_token: null,
                reset_token_expiry: null
            }, { transaction });
            yield transaction.commit();
            res.json({
                status: 'success',
                message: '비밀번호가 성공적으로 재설정되었습니다.'
            });
        }
        catch (error) {
            yield transaction.rollback();
            console.error('비밀번호 재설정 오류:', error);
            res.status(500).json({
                status: 'error',
                message: '비밀번호 재설정 중 오류가 발생했습니다.'
            });
        }
    }),
    deleteAccount: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const transaction = yield models_1.default.sequelize.transaction();
        try {
            const user_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!user_id) {
                yield transaction.rollback();
                return res.status(401).json({
                    status: 'error',
                    message: '인증이 필요합니다.'
                });
            }
            const user = yield models_1.default.User.findByPk(user_id, { transaction });
            if (!user) {
                yield transaction.rollback();
                return res.status(404).json({
                    status: 'error',
                    message: '사용자를 찾을 수 없습니다.'
                });
            }
            // Soft delete implementation
            yield user.update({
                is_deleted: true,
                deleted_at: new Date(),
                email: `deleted_${user.user_id}_${user.email}`,
                username: `deleted_${user.user_id}_${user.username}`
            }, { transaction });
            yield transaction.commit();
            res.json({
                status: 'success',
                message: '계정이 성공적으로 삭제되었습니다.'
            });
        }
        catch (error) {
            yield transaction.rollback();
            console.error('계정 삭제 오류:', error);
            res.status(500).json({
                status: 'error',
                message: '계정 삭제 중 오류가 발생했습니다.'
            });
        }
    })
};
exports.default = userController;
