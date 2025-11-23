import Store from '../models/Store.js';
import Rating from '../models/Rating.js';
import { pool } from '../config/db.js';

// @desc    Get store owner dashboard data
// @route   GET /api/store-owner/dashboard
// @access  Private/Store Owner
export const getDashboard = async (req, res, next) => {
  try {
    const ownerId = req.user.id;

    // Get store owner's store
    const [stores] = await pool.query(
      'SELECT * FROM stores WHERE owner_id = ?',
      [ownerId]
    );

    if (stores.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No store found for this owner'
      });
    }

    const store = stores[0];

    // Get average rating and total ratings
    const [ratingStats] = await pool.query(
      `SELECT 
        ROUND(AVG(rating), 2) as average_rating,
        COUNT(*) as total_ratings
      FROM ratings 
      WHERE store_id = ?`,
      [store.id]
    );

    // Get users who rated the store
    const [ratingUsers] = await pool.query(
      `SELECT 
        r.id as rating_id,
        r.rating,
        r.comment,
        r.created_at,
        u.id as user_id,
        u.name as user_name,
        u.email as user_email
      FROM ratings r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.store_id = ?
      ORDER BY r.created_at DESC`,
      [store.id]
    );

    res.status(200).json({
      success: true,
      data: {
        store: {
          id: store.id,
          name: store.name,
          email: store.email,
          address: store.address,
          description: store.description
        },
        stats: {
          average_rating: ratingStats[0].average_rating || 0,
          total_ratings: ratingStats[0].total_ratings || 0
        },
        ratings: ratingUsers
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get store details
// @route   GET /api/store-owner/store
// @access  Private/Store Owner
export const getStore = async (req, res, next) => {
  try {
    const ownerId = req.user.id;

    const [stores] = await pool.query(
      `SELECT 
        s.*,
        ROUND(AVG(r.rating), 2) as average_rating,
        COUNT(r.id) as total_ratings
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.owner_id = ?
      GROUP BY s.id`,
      [ownerId]
    );

    if (stores.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No store found for this owner'
      });
    }

    res.status(200).json({
      success: true,
      store: stores[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all ratings for store owner's store
// @route   GET /api/store-owner/ratings
// @access  Private/Store Owner
export const getRatings = async (req, res, next) => {
  try {
    const ownerId = req.user.id;

    // Get store id
    const [stores] = await pool.query(
      'SELECT id FROM stores WHERE owner_id = ?',
      [ownerId]
    );

    if (stores.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No store found for this owner'
      });
    }

    const storeId = stores[0].id;

    // Get all ratings with user details
    const [ratings] = await pool.query(
      `SELECT 
        r.*,
        u.name as user_name,
        u.email as user_email
      FROM ratings r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.store_id = ?
      ORDER BY r.created_at DESC`,
      [storeId]
    );

    res.status(200).json({
      success: true,
      count: ratings.length,
      ratings
    });
  } catch (error) {
    next(error);
  }
};