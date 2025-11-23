import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { testConnection, initializeDatabase } from './config/db.js';
import authRoutes from './routes/authRoute.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import adminRoutes from './routes/adminRoutes.js';
import storeOwnerRoutes from './routes/storeOwnerRoutes.js';
import userRoutes from './routes/userRoutes.js';

// Load environment variables
dotenv.config();

// Increase max listeners
process.setMaxListeners(15);

// Initialize express app
const app = express();

// CORS Configuration - MUST BE BEFORE OTHER MIDDLEWARE

const API = process.env.FRONTEND_URL;
const corsOptions = {
origin: ['https://roxiler-systems-assignment-nov.vercel.app', 'http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// Body parser middleware - AFTER CORS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);

app.use('/api/admin', adminRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/store-owner', storeOwnerRoutes);
app.use('/api/user', userRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT;

const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    // Initialize database tables
    await initializeDatabase();

    // Start listening
    app.listen(PORT, () => {
      console.log(
        `Server running on port ${PORT} in ${process.env.NODE_ENV} mode`
      );
      console.log(` API available at http://localhost:${PORT}/api`);
      console.log(` CORS enabled for http://localhost:5173`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
