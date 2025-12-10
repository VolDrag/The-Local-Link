//######Rafi#######
// Category Controller
// API functions to get categories
import asyncHandler from 'express-async-handler';
import Category from '../models/Category.js';

// Get all active categories
// @route   GET /api/categories
// @access  Public (anyone can see categories)
export const getCategories = asyncHandler(async (req, res) => {
  // Find all categories that are active and sort by name
  const categories = await Category.find({ isActive: true }).sort({ name: 1 });
  
  // Send categories to frontend
  res.json(categories);
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
