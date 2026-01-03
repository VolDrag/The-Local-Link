// Report Controller
import Report from '../models/Report.js';
import Service from '../models/Service.js';

// @desc    Create a new report for a service
// @route   POST /api/reports
// @access  Private (Authenticated users)
export const createReport = async (req, res) => {
  try {
    const { serviceId, reason, details } = req.body;

    // Validate required fields
    if (!serviceId || !reason || !details) {
      return res.status(400).json({
        success: false,
        message: 'Please provide service ID, reason, and details'
      });
    }

    // Check if service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check if user already reported this service
    const existingReport = await Report.findOne({
      reporter: req.user._id,
      reportedService: serviceId
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: 'You have already reported this service'
      });
    }

    // Create the report
    const report = await Report.create({
      reporter: req.user._id,
      reportedService: serviceId,
      reportedUser: service.provider,
      reason,
      details,
      status: 'pending_review'
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully. Our team will review it shortly.',
      data: report
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting report',
      error: error.message
    });
  }
};

// @desc    Get current user's reports
// @route   GET /api/reports/my-reports
// @access  Private
export const getUserReports = async (req, res) => {
  try {
    const reports = await Report.find({ reporter: req.user._id })
      .populate('reportedService', 'title images')
      .populate('reportedUser', 'username businessName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    console.error('Get user reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching your reports',
      error: error.message
    });
  }
};

// @desc    Get a single report by ID
// @route   GET /api/reports/:id
// @access  Private
export const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('reportedService', 'title description images')
      .populate('reportedUser', 'username businessName email')
      .populate('reporter', 'username email');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check if user is the reporter or admin
    if (report.reporter._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this report'
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
