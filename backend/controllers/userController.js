import { pool } from '../config/db.js';

// @desc    Get all stores for normal users
// @route   GET /api/user/stores
// @access  Private/Normal User
export const getAllStores = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get all stores with their ratings
    const [stores] = await pool.query(`
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        s.description,
        u.name as owner_name,
        ROUND(AVG(r.rating), 2) as average_rating,
        COUNT(r.id) as total_ratings,
        ur.rating as user_rating,
        ur.comment as user_comment,
        ur.id as user_rating_id
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      LEFT JOIN ratings r ON s.id = r.store_id
      LEFT JOIN ratings ur ON s.id = ur.store_id AND ur.user_id = ?
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `, [userId]);

    res.status(200).json({
      success: true,
      count: stores.length,
      stores
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit or update rating for a store
// @route   POST /api/user/stores/:storeId/rate
// @access  Private/Normal User
export const rateStore = async (req, res, next) => {
  try {
    const { storeId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Check if store exists
    const [stores] = await pool.query('SELECT id FROM stores WHERE id = ?', [storeId]);
    if (stores.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    // Check if user already rated this store
    const [existingRating] = await pool.query(
      'SELECT id FROM ratings WHERE store_id = ? AND user_id = ?',
      [storeId, userId]
    );

    if (existingRating.length > 0) {
      // Update existing rating
      await pool.query(
        'UPDATE ratings SET rating = ?, comment = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [rating, comment, existingRating[0].id]
      );

      res.status(200).json({
        success: true,
        message: 'Rating updated successfully'
      });
    } else {
      // Insert new rating
      await pool.query(
        'INSERT INTO ratings (store_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
        [storeId, userId, rating, comment]
      );

      res.status(201).json({
        success: true,
        message: 'Rating submitted successfully'
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's ratings
// @route   GET /api/user/my-ratings
// @access  Private/Normal User
export const getMyRatings = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [ratings] = await pool.query(`
      SELECT 
        r.*,
        s.name as store_name,
        s.email as store_email,
        s.address as store_address
      FROM ratings r
      LEFT JOIN stores s ON r.store_id = s.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `, [userId]);

    res.status(200).json({
      success: true,
      count: ratings.length,
      ratings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete rating
// @route   DELETE /api/user/ratings/:ratingId
// @access  Private/Normal User
export const deleteRating = async (req, res, next) => {
  try {
    const { ratingId } = req.params;
    const userId = req.user.id;

    // Check if rating exists and belongs to user
    const [rating] = await pool.query(
      'SELECT id FROM ratings WHERE id = ? AND user_id = ?',
      [ratingId, userId]
    );

    if (rating.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found or unauthorized'
      });
    }

    await pool.query('DELETE FROM ratings WHERE id = ?', [ratingId]);

    res.status(200).json({
      success: true,
      message: 'Rating deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};