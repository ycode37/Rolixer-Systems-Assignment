import express from 'express';
import {
  getAllStores,
  rateStore,
  getMyRatings,
  deleteRating
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected and normal user only
router.use(protect, authorize('normal_user'));

// Store routes
router.get('/stores', getAllStores);
router.post('/stores/:storeId/rate', rateStore);

// User ratings
router.get('/my-ratings', getMyRatings);
router.delete('/ratings/:ratingId', deleteRating);

export default router;