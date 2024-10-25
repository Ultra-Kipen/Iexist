"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_1 = __importDefault(require("./users"));
const emotions_1 = __importDefault(require("./emotions"));
const myDay_1 = __importDefault(require("./myDay"));
const someoneDay_1 = __importDefault(require("./someoneDay"));
const challenges_1 = __importDefault(require("./challenges"));
const stats_1 = __importDefault(require("./stats"));
const notifications_1 = __importDefault(require("./notifications"));
const router = (0, express_1.Router)();
// Health check
router.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});
// API Routes
router.use('/users', users_1.default);
router.use('/emotions', emotions_1.default);
router.use('/my-day', myDay_1.default);
router.use('/someone-day', someoneDay_1.default);
router.use('/challenges', challenges_1.default);
router.use('/stats', stats_1.default);
router.use('/notifications', notifications_1.default);
exports.default = router;
