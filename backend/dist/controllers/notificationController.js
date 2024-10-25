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
const models_1 = __importDefault(require("../models"));
const notificationController = {
    getNotifications: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const user_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!user_id) {
                return res.status(401).json({
                    status: 'error',
                    message: '인증이 필요합니다.'
                });
            }
            const { page = '1', limit = '10', type, is_read } = req.query;
            const offset = (Number(page) - 1) * Number(limit);
            const whereClause = { user_id };
            if (type) {
                whereClause.notification_type = type;
            }
            if (is_read !== undefined) {
                whereClause.is_read = is_read === 'true';
            }
            const notifications = yield models_1.default.Notification.findAndCountAll({
                where: whereClause,
                order: [['created_at', 'DESC']],
                limit: Number(limit),
                offset,
                attributes: [
                    'notification_id',
                    'content',
                    'notification_type',
                    'is_read',
                    'created_at',
                    'related_id'
                ]
            });
            res.json({
                status: 'success',
                data: {
                    notifications: notifications.rows,
                    pagination: {
                        current_page: Number(page),
                        total_pages: Math.ceil(notifications.count / Number(limit)),
                        total_count: notifications.count,
                        has_next: offset + Number(limit) < notifications.count
                    }
                }
            });
        }
        catch (error) {
            console.error('알림 조회 오류:', error);
            res.status(500).json({
                status: 'error',
                message: '알림 조회 중 오류가 발생했습니다.'
            });
        }
    }),
    markNotificationAsRead: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const transaction = yield models_1.default.sequelize.transaction();
        try {
            const { id } = req.params;
            const user_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!user_id) {
                yield transaction.rollback();
                return res.status(401).json({
                    status: 'error',
                    message: '인증이 필요합니다.'
                });
            }
            const notification = yield models_1.default.Notification.findOne({
                where: {
                    notification_id: id,
                    user_id
                },
                transaction
            });
            if (!notification) {
                yield transaction.rollback();
                return res.status(404).json({
                    status: 'error',
                    message: '알림을 찾을 수 없습니다.'
                });
            }
            notification.is_read = true;
            yield notification.save({ transaction });
            yield transaction.commit();
            res.json({
                status: 'success',
                message: '알림이 읽음 처리되었습니다.'
            });
        }
        catch (error) {
            yield transaction.rollback();
            console.error('알림 읽음 처리 오류:', error);
            res.status(500).json({
                status: 'error',
                message: '알림 읽음 처리 중 오류가 발생했습니다.'
            });
        }
    }),
    deleteNotification: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const transaction = yield models_1.default.sequelize.transaction();
        try {
            const { id } = req.params;
            const user_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!user_id) {
                yield transaction.rollback();
                return res.status(401).json({
                    status: 'error',
                    message: '인증이 필요합니다.'
                });
            }
            const result = yield models_1.default.Notification.destroy({
                where: {
                    notification_id: id,
                    user_id
                },
                transaction
            });
            if (result === 0) {
                yield transaction.rollback();
                return res.status(404).json({
                    status: 'error',
                    message: '알림을 찾을 수 없습니다.'
                });
            }
            yield transaction.commit();
            res.json({
                status: 'success',
                message: '알림이 성공적으로 삭제되었습니다.'
            });
        }
        catch (error) {
            yield transaction.rollback();
            console.error('알림 삭제 오류:', error);
            res.status(500).json({
                status: 'error',
                message: '알림 삭제 중 오류가 발생했습니다.'
            });
        }
    }),
    markAllAsRead: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
            yield models_1.default.Notification.update({ is_read: true }, {
                where: {
                    user_id,
                    is_read: false
                },
                transaction
            });
            yield transaction.commit();
            res.json({
                status: 'success',
                message: '모든 알림이 읽음 처리되었습니다.'
            });
        }
        catch (error) {
            yield transaction.rollback();
            console.error('전체 알림 읽음 처리 오류:', error);
            res.status(500).json({
                status: 'error',
                message: '전체 알림 읽음 처리 중 오류가 발생했습니다.'
            });
        }
    })
};
exports.default = notificationController;
