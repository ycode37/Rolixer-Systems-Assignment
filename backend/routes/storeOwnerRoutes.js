import express from 'express';
import {
  getDashboard,
  getStore,
  getRatings
} from '../controllers/storeOwnerController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected and store owner only
router.use(protect, authorize('store_owner'));

// Dashboard
router.get('/dashboard', getDashboard);
router.get('/store', getStore);
router.get('/ratings', getRatings);

export default router;