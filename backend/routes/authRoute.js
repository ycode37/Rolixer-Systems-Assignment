import express from 'express';
import {
  signup,
  login,
  getMe,
  logout,
  changePassword,
} from '../controllers/authController.js';
import {
  signupValidation,
  loginValidation,
  validate,
} from '../utils/validators.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/signup', signupValidation, validate, signup);
router.post('/login', loginValidation, validate, login);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.post('/change-password', protect, changePassword);

export default router;
