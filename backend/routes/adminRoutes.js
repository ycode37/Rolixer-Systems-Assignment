import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
  getUserById,
  createUser,
  getAllStores,
  createStore,
  getAllRatings,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Validation middleware for admin operations
const adminUserValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('role')
    .isIn(['admin', 'store_owner', 'normal_user'])
    .withMessage('Invalid role'),
];

const adminStoreValidation = [
  body('name').trim().notEmpty().withMessage('Store name is required'),
  body('email').trim().isEmail().withMessage('Valid store email is required'),
  body('owner_name')
    .trim()
    .notEmpty()
    .withMessage('Store owner name is required'),
  body('owner_email')
    .trim()
    .isEmail()
    .withMessage('Valid owner email is required'),
  body('temporary_password')
    .isLength({ min: 8 })
    .withMessage('Temporary password must be at least 8 characters'),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

// All routes are protected and admin only
router.use(protect, authorize('admin'));

// Dashboard
router.get('/dashboard', getDashboardStats);

// Users
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.post('/users', adminUserValidation, validate, createUser);

// Stores
router.get('/stores', getAllStores);
router.post('/stores', adminStoreValidation, validate, createStore);

// Ratings
router.get('/ratings', getAllRatings);

export default router;
