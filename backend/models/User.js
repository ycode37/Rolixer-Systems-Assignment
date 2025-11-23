import { pool } from '../config/db.js';
import bcrypt from 'bcryptjs';

class User {
  // Create new user
  static async create(userData) {
    const { name, email, password, address, role } = userData;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, address, role]
    );

    return result.insertId;
  }

  // Find user by email
  static async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [
      email,
    ]);
    return rows[0];
  }

  // Find user by ID
  static async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, name, email, address, role, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  // Compare password
  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Check if user exists
  static async exists(email) {
    const [rows] = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE email = ?',
      [email]
    );
    return rows[0].count > 0;
  }

  // Update user
  static async update(id, updates) {
    const fields = [];
    const values = [];

    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    });

    if (fields.length === 0) return false;

    values.push(id);
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;

    const [result] = await pool.query(query, values);
    return result.affectedRows > 0;
  }

  // Delete user
  static async delete(id) {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  // Get all users (admin only)
  static async findAll(filters = {}) {
    let query =
      'SELECT id, name, email, address, role, created_at FROM users WHERE 1=1';
    const values = [];

    if (filters.role) {
      query += ' AND role = ?';
      values.push(filters.role);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.query(query, values);
    return rows;
  }
  // Add this method to the User class (after the findAll method)

  // Get all users with filters
  // Get all users with filters
  static async findAllWithFilters(filters = {}) {
    let query =
      'SELECT id, name, email, address, role, created_at FROM users WHERE 1=1';
    const values = [];

    if (filters.name) {
      query += ' AND name LIKE ?';
      values.push(`%${filters.name}%`);
    }

    if (filters.email) {
      query += ' AND email LIKE ?';
      values.push(`%${filters.email}%`);
    }

    if (filters.address) {
      query += ' AND address LIKE ?';
      values.push(`%${filters.address}%`);
    }

    if (filters.role) {
      query += ' AND role = ?';
      values.push(filters.role);
    }

    // Add sorting
    const sortBy = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder === 'ASC' ? 'ASC' : 'DESC';

    // Validate sortBy to prevent SQL injection
    const allowedSortFields = ['id', 'name', 'email', 'role', 'created_at'];
    if (allowedSortFields.includes(sortBy)) {
      query += ` ORDER BY ${sortBy} ${sortOrder}`;
    } else {
      query += ' ORDER BY created_at DESC';
    }

    const [rows] = await pool.query(query, values);
    return rows;
  }

  // Get user with store rating if store owner
  static async findByIdWithRating(id) {
    const [rows] = await pool.query(
      `
    SELECT 
      u.id, u.name, u.email, u.address, u.role, u.created_at,
      CASE 
        WHEN u.role = 'store_owner' THEN (
          SELECT ROUND(AVG(r.rating), 2)
          FROM stores s
          LEFT JOIN ratings r ON s.id = r.store_id
          WHERE s.owner_id = u.id
        )
        ELSE NULL
      END as average_rating
    FROM users u
    WHERE u.id = ?
  `,
      [id]
    );
    return rows[0];
  }
}

export default User;
