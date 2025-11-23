import { pool } from '../config/db.js';

class Rating {
  // Get total count
  static async getCount() {
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM ratings');
    return rows[0].count;
  }

  // Get all ratings
  static async findAll() {
    const [rows] = await pool.query(`
      SELECT 
        r.*,
        u.name as user_name,
        s.name as store_name
      FROM ratings r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN stores s ON r.store_id = s.id
      ORDER BY r.created_at DESC
    `);
    return rows;
  }
}

export default Rating;