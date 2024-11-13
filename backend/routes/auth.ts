import express from 'express';
import userController from '../controllers/userController';

const router = express.Router();

// validation middleware는 일단 제거하고 테스트
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/logout', userController.logout);

export default router;