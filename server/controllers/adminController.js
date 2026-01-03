// Admin Controller
import User from '../models/User.js';
import Service from '../models/Service.js';
import Category from '../models/Category.js';
import Booking from '../models/Booking.js';
import Report from '../models/Report.js';
import Notification from '../models/Notification.js';
import Event from '../models/Event.js';

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

    // Count events
    const totalEvents = await Event.countDocuments();

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
          pendingReports,
          totalEvents
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
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message
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

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private (Admin only)
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('seeker', 'username email phone')
      .populate('provider', 'businessName username email phone')
      .populate('service', 'title price')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
      error: error.message
    });
  }
};

// @desc    Create category
// @route   POST /api/admin/categories
// @access  Private (Admin only)
export const createCategory = async (req, res) => {
  try {
    const { name, description, icon } = req.body;

    // Check if category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category already exists'
      });
    }

    const category = await Category.create({
      name,
      description,
      icon: icon || '📦'
    });

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating category',
      error: error.message
    });
  }
};

// @desc    Get all categories
// @route   GET /api/admin/categories
// @access  Private (Admin only)
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get all categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
};

// @desc    Update category
// @route   PUT /api/admin/categories/:id
// @access  Private (Admin only)
export const updateCategory = async (req, res) => {
  try {
    const { name, description, icon, isActive } = req.body;

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description, icon, isActive },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating category',
      error: error.message
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/admin/categories/:id
// @access  Private (Admin only)
export const deleteCategory = async (req, res) => {
  try {
    // Check if category has services
    const servicesCount = await Service.countDocuments({ category: req.params.id });
    
    if (servicesCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It has ${servicesCount} service(s) associated with it.`
      });
    }

    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting category',
      error: error.message
    });
  }
};

// @desc    Get all reports (Admin view)
// @route   GET /api/admin/reports
// @access  Private (Admin only)
export const getAllReports = async (req, res) => {
  try {
    const { status } = req.query;
    
    const filter = status ? { status } : {};
    
    const reports = await Report.find(filter)
      .populate('reportedService', 'title description images')
      .populate({
        path: 'reportedService',
        populate: { path: 'provider', select: 'username businessName email phone' }
      })
      .populate('reporter', 'username email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    console.error('Get all reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reports',
      error: error.message
    });
  }
};

// @desc    Get single report (Admin view)
// @route   GET /api/admin/reports/:id
// @access  Private (Admin only)
export const getReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('reportedService')
      .populate({
        path: 'reportedService',
        populate: { path: 'provider', select: 'username businessName email phone' }
      })
      .populate('reporter', 'username email');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching report',
      error: error.message
    });
  }
};

// @desc    Update report status (Admin only)
// @route   PUT /api/admin/reports/:id
// @access  Private (Admin only)
export const updateReport = async (req, res) => {
  try {
    const { status, adminResponse } = req.body;

    if (!['pending_review', 'resolved'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    // Find the report first to get reporter info
    const existingReport = await Report.findById(req.params.id)
      .populate('reportedService', 'title');

    if (!existingReport) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Update the report
    const updateData = { status };
    if (adminResponse) {
      updateData.adminResponse = adminResponse;
    }

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('reportedService', 'title')
      .populate('reporter', 'username email');

    // Send notification to the reporter when admin responds
    if (status === 'resolved' || adminResponse) {
      const notificationTitle = status === 'resolved' 
        ? '✅ Your Report Has Been Reviewed' 
        : '📢 Admin Response to Your Report';
      
      const notificationMessage = adminResponse 
        ? `Admin response: ${adminResponse}`
        : `Your report about "${existingReport.reportedService?.title || 'the service'}" has been ${status === 'resolved' ? 'resolved' : 'updated'}.`;

      await Notification.create({
        recipient: existingReport.reporter,
        sender: req.user._id,
        type: 'system',
        title: notificationTitle,
        message: notificationMessage,
        link: `/reports/${report._id}`
      });
    }

    res.json({
      success: true,
      message: 'Report status updated successfully',
      data: report
    });
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating report',
      error: error.message
    });
  }
};

// @desc    Delete report (Admin only)
// @route   DELETE /api/admin/reports/:id
// @access  Private (Admin only)
export const deleteReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting report',
      error: error.message
    });
  }
};

export {
  deleteUser,
  deleteService
};
