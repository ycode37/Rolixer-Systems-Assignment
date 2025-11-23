import { pool } from '../config/db.js';

class Store {
  // Create new store
  static async create(storeData) {
    const { name, email, description, address, owner_id } = storeData;

    const [result] = await pool.query(
      'INSERT INTO stores (name, email, description, address, owner_id) VALUES (?, ?, ?, ?, ?)',
      [name, email, description, address, owner_id]
    );

    return result.insertId;
  }

  // Find store by ID
  static async findById(id) {
    const [rows] = await pool.query(
      `
      SELECT 
        s.*, 
        u.name as owner_name,
        u.email as owner_email,
        ROUND(AVG(r.rating), 2) as average_rating,
        COUNT(r.id) as total_ratings
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.id = ?
      GROUP BY s.id
    `,
      [id]
    );
    return rows[0];
  }

  // Get all stores with filters
  // Get all stores with filters
  static async findAllWithFilters(filters = {}) {
    let query = `
    SELECT 
      s.*, 
      u.name as owner_name,
      u.email as owner_email,
      ROUND(AVG(r.rating), 2) as average_rating,
      COUNT(r.id) as total_ratings
    FROM stores s
    LEFT JOIN users u ON s.owner_id = u.id
    LEFT JOIN ratings r ON s.id = r.store_id
    WHERE 1=1
  `;
    const values = [];

    if (filters.name) {
      query += ' AND s.name LIKE ?';
      values.push(`%${filters.name}%`);
    }

    if (filters.email) {
      query += ' AND u.email LIKE ?';
      values.push(`%${filters.email}%`);
    }

    if (filters.address) {
      query += ' AND s.address LIKE ?';
      values.push(`%${filters.address}%`);
    }

    query += ' GROUP BY s.id';

    // Add sorting
    const sortBy = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder === 'ASC' ? 'ASC' : 'DESC';

    // Validate sortBy to prevent SQL injection
    const allowedSortFields = ['id', 'name', 'average_rating', 'created_at'];
    if (allowedSortFields.includes(sortBy)) {
      if (sortBy === 'average_rating') {
        query += ` ORDER BY average_rating ${sortOrder}`;
      } else {
        query += ` ORDER BY s.${sortBy} ${sortOrder}`;
      }
    } else {
      query += ' ORDER BY s.created_at DESC';
    }

    const [rows] = await pool.query(query, values);
    return rows;
  }

  // Get total count
  static async getCount() {
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM stores');
    return rows[0].count;
  }

  // Delete store
  static async delete(id) {
    const [result] = await pool.query('DELETE FROM stores WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

export default Store;
