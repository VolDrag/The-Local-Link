//######Rafi#######
// Category Controller
// API functions to get categories
import asyncHandler from 'express-async-handler';
import Category from '../models/Category.js';
import Service from '../models/Service.js';
import Event from '../models/Event.js';

// Get all active categories with service counts
// @route   GET /api/categories
// @access  Public (anyone can see categories)
export const getCategories = asyncHandler(async (req, res) => {
  // Aggregate service counts per category
  const serviceCounts = await Service.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 }
      }
    }
  ]);

  // Create a map of category ID to service count
  const countMap = {};
  serviceCounts.forEach(item => {
    countMap[item._id.toString()] = item.count;
  });

  // Find all active categories and sort by name
  const categories = await Category.find({ isActive: true }).sort({ name: 1 });
  
  // Get active events with discounts
  const now = new Date();
  const activeEvents = await Event.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now }
  });

  // Create a map of category name to discount (normalize with trim and lowercase)
  const discountMap = {};
  activeEvents.forEach(event => {
    if (event.discount && event.category) {
      const normalizedCategory = event.category.trim().toLowerCase();
      discountMap[normalizedCategory] = {
        discount: event.discount,
        title: event.title,
        endDate: event.endDate
      };
    }
  });
  
  // Add service count and discount info to each category
  const categoriesWithCounts = categories.map(category => {
    const categoryObj = {
      _id: category._id,
      name: category.name,
      description: category.description,
      icon: category.icon,
      isActive: category.isActive,
      serviceCount: countMap[category._id.toString()] || 0
    };

    // Add discount info if available (normalize category name)
    const normalizedCategoryName = category.name.trim().toLowerCase();
    const discountInfo = discountMap[normalizedCategoryName];
    if (discountInfo) {
      const percentMatch = discountInfo.discount.match(/(\d+)%/);
      const discountPercent = percentMatch ? parseInt(percentMatch[1]) : 0;
      
      categoryObj.hasDiscount = true;
      categoryObj.discountPercentage = discountPercent;
      categoryObj.discountText = discountInfo.discount;
      categoryObj.discountEventTitle = discountInfo.title;
      categoryObj.discountEndDate = discountInfo.endDate;
    } else {
      categoryObj.hasDiscount = false;
    }

    return categoryObj;
  });

  // Send categories to frontend
  res.json(categoriesWithCounts);
});

// Get single category by ID
// @route   GET /api/categories/:id
// @access  Public (anyone can see category)
export const getCategoryById = asyncHandler(async (req, res) => {
  // Find category by ID
  const category = await Category.findById(req.params.id);

  // Check if category exists and is active
  if (!category || !category.isActive) {
    res.status(404);
    throw new Error('Category not found');
  }

  // Send category details
  res.json(category);
});
