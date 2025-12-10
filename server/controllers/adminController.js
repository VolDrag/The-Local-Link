// Admin Controller
import User from '../models/User.js';
import Service from '../models/Service.js';
import Category from '../models/Category.js';
import Booking from '../models/Booking.js';
import Report from '../models/Report.js';

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard/stats
// @access  Private (Admin only)
export const getDashboardStats = async (req, res) => {
  try {
    // Count users by role
    const totalUsers = await User.countDocuments();
    const totalSeekers = await User.countDocuments({ role: 'seeker' });
    const totalProviders = await User.countDocuments({ role: 'provider' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const verifiedProviders = await User.countDocuments({ 
      role: 'provider', 
      isVerified: true 
    });

    // Count services and categories
    const totalServices = await Service.countDocuments();
    const totalCategories = await Category.countDocuments();
    const activeCategories = await Category.countDocuments({ isActive: true });

    // Count bookings
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });

    // Count reports
    const totalReports = await Report.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'pending_review' });

    // Get recent users (last 5)
    const recentUsers = await User.find()
      .select('username email role createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get recent services (last 5)
    const recentServices = await Service.find()
      .populate('provider', 'businessName username')
      .populate('category', 'name')
      .select('title provider category createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    // Category breakdown (services per category)
    const categoryBreakdown = await Service.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      {
        $unwind: '$categoryInfo'
      },
      {
        $project: {
          name: '$categoryInfo.name',
          count: 1
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalSeekers,
          totalProviders,
          totalAdmins,
          verifiedProviders,
          totalServices,
          totalCategories,
          activeCategories,
          totalBookings,
          pendingBookings,
          confirmedBookings,
          totalReports,
          pendingReports
        },
        recentActivity: {
          recentUsers,
          recentServices
        },
        analytics: {
          categoryBreakdown
        }
      }
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res) => {
  // TODO: Implement delete user
};

// @desc    Get all services (admin view)
// @route   GET /api/admin/services
// @access  Private (Admin only)
export const getAllServices = async (req, res) => {
  try {
    console.log('Getting all services for admin...');
    const services = await Service.find()
      .populate('provider', 'username businessName email phone')
      .populate('category', 'name')
      .sort({ createdAt: -1 });

    console.log(`Found ${services.length} services`);
    
    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    console.error('Get all services error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching services',
      error: error.message
    });
  }
};

// @desc    Delete service
// @route   DELETE /api/admin/services/:id
// @access  Private (Admin only)
const deleteService = async (req, res) => {
  // TODO: Implement delete service
};

// @desc    Create category
// @route   POST /api/admin/categories
// @access  Private (Admin only)
const createCategory = async (req, res) => {
  // TODO: Implement create category
};

// @desc    Get all categories
// @route   GET /api/admin/categories
// @access  Private (Admin only)
const getAllCategories = async (req, res) => {
  // TODO: Implement get all categories
};

// @desc    Update category
// @route   PUT /api/admin/categories/:id
// @access  Private (Admin only)
const updateCategory = async (req, res) => {
  // TODO: Implement update category
};

// @desc    Delete category
// @route   DELETE /api/admin/categories/:id
// @access  Private (Admin only)
const deleteCategory = async (req, res) => {
  // TODO: Implement delete category
};

export {
  deleteUser,
  deleteService,
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
};
