import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Retry connection helper
const retryConnection = async (connectionFn, maxRetries = 3, delay = 2000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await connectionFn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.log(`⚠️  Connection attempt ${i + 1} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; 
    }
  }
};

// Create connection pool without database first
const createDatabaseIfNotExists = async () => {
  try {
    console.log(`Attempting to connect to ${process.env.DB_HOST}:${process.env.DB_PORT || 3306}...`);
    

    const connection = await retryConnection(async () => {
      return await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT) || 3306,
        connectTimeout: 120000, 
        ssl: {
          rejectUnauthorized: false
        }
      });
    });

    // Create database if it doesn't exist
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`
    );
    console.log(`Database '${process.env.DB_NAME}' is ready`);

    await connection.end();
  } catch (error) {
    console.error('Error creating database:', error.message);
    console.error(`Connection details: Host: ${process.env.DB_HOST}, Port: ${process.env.DB_PORT || 3306}, User: ${process.env.DB_USER}`);
    throw error;
  }
};

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 120000, 
  ssl: {
    rejectUnauthorized: false
  },
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test database connection
const testConnection = async () => {
  try {

    await createDatabaseIfNotExists();


    await retryConnection(async () => {
      const connection = await pool.getConnection();
      await connection.ping(); // Test the connection
      console.log('MySQL Database connected successfully');
      connection.release();
    });
  } catch (error) {
    console.error('Database connection failed:', error.message);
    console.error(`Connection details: Host: ${process.env.DB_HOST}, Port: ${process.env.DB_PORT || 3306}, Database: ${process.env.DB_NAME}, User: ${process.env.DB_USER}`);
    console.error('Full error:', error);
    console.error('\n Troubleshooting tips:');
    // console.error('   1. Verify your DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, and DB_NAME in .env file');
    // console.error('   2. Check if your Aiven service is running and accessible');
    // console.error('   3. Verify firewall/network settings allow connections to the Aiven host');
    // console.error('   4. Check if your IP is whitelisted in Aiven (if required)');
    process.exit(1);
  }
};

// Initialize database tables
const initializeDatabase = async () => {
  try {
    const connection = await pool.getConnection();

    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(60) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        address VARCHAR(400),
        role ENUM('admin', 'store_owner', 'normal_user') NOT NULL DEFAULT 'normal_user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Create stores table (for future use)
    await connection.query(`
  CREATE TABLE IF NOT EXISTS stores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    description TEXT,
    address VARCHAR(400),
    owner_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_owner (owner_id),
    INDEX idx_email (email)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`);

    // Create ratings table (for future use)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS ratings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        store_id INT NOT NULL,
        user_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_store_rating (user_id, store_id),
        INDEX idx_store (store_id),
        INDEX idx_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('Database tables initialized successfully');
    connection.release();
  } catch (error) {
    console.error('Database initialization failed:', error.message);
    throw error;
  }
};

export { pool, testConnection, initializeDatabase };
