import User from '../models/User.js';
import Store from '../models/Store.js';
import Rating from '../models/Rating.js';

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = (await User.findAll()).length;
    const totalStores = await Store.getCount();
    const totalRatings = await Rating.getCount();

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalStores,
        totalRatings,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with filters
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res, next) => {
  try {
    const filters = {
      name: req.query.name,
      email: req.query.email,
      address: req.query.address,
      role: req.query.role,
      sortBy: req.query.sortBy || 'created_at', // Default sort by created_at
      sortOrder: req.query.sortOrder || 'DESC', // Default descending
    };

    const users = await User.findAllWithFilters(filters);

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID with rating
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findByIdWithRating(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new user (by admin)
// @route   POST /api/admin/users
// @access  Private/Admin
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, address, role } = req.body;

    // Check if user already exists
    const userExists = await User.exists(email);
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Create user
    const userId = await User.create({
      name,
      email,
      password,
      address,
      role: role || 'normal_user',
    });

    const user = await User.findById(userId);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all stores with filters
// @route   GET /api/admin/stores
// @access  Private/Admin
export const getAllStores = async (req, res, next) => {
  try {
    const filters = {
      name: req.query.name,
      email: req.query.email,
      address: req.query.address,
      sortBy: req.query.sortBy || 'created_at', // Default sort by created_at
      sortOrder: req.query.sortOrder || 'DESC', // Default descending
    };

    const stores = await Store.findAllWithFilters(filters);

    res.status(200).json({
      success: true,
      count: stores.length,
      stores,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new store
// @route   POST /api/admin/stores
// @access  Private/Admin
// @desc    Create new store
// @route   POST /api/admin/stores
// @access  Private/Admin
export const createStore = async (req, res, next) => {
  try {
    const { name, email, description, address, owner_name, owner_email, temporary_password } = req.body;

    // Check if owner email already exists
    const existingUser = await User.exists(owner_email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists'
      });
    }

    // Create store owner user account with temporary password
    const ownerId = await User.create({
      name: owner_name,
      email: owner_email,
      password: temporary_password,
      address: '',
      role: 'store_owner'
    });

    // Create the store
    const storeId = await Store.create({
      name,
      email,
      description,
      address,
      owner_id: ownerId
    });

    const store = await Store.findById(storeId);

    res.status(201).json({
      success: true,
      message: 'Store and store owner account created successfully',
      store,
      owner: {
        id: ownerId,
        name: owner_name,
        email: owner_email,
        temporary_password: temporary_password
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all ratings
// @route   GET /api/admin/ratings
// @access  Private/Admin
export const getAllRatings = async (req, res, next) => {
  try {
    const ratings = await Rating.findAll();

    res.status(200).json({
      success: true,
      count: ratings.length,
      ratings,
    });
  } catch (error) {
    next(error);
  }
};
