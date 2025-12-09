// ifty
import asyncHandler from 'express-async-handler';
import Service from '../models/Service.js';
import User from '../models/User.js';

// @desc    Get all services (with filters)
// @route   GET /api/services
// @access  Public
const getServices = asyncHandler(async (req, res) => {
  const {
    keyword,
    city,
    area,
    country,
    category,
    minRating,
    sort = 'relevance',
    page = 1,
    limit = 20,
  } = req.query;

  const query = { isActive: true };

  // Text search for keyword
  if (keyword) {
    query.$text = { $search: keyword };
  }

  // Location filters
  if (city) query['location.city'] = { $regex: city, $options: 'i' };
  if (area) query['location.area'] = { $regex: area, $options: 'i' };
  if (country) query['location.country'] = { $regex: country, $options: 'i' };

  // Category filter
  if (category) query.category = category;

  // Rating filter
  if (minRating) query.averageRating = { $gte: parseFloat(minRating) };

  // Determine sort order
  let sortOption = {};
  if (keyword && sort === 'relevance') {
    sortOption = { score: { $meta: 'textScore' } };
  } else if (sort === 'rating') {
    sortOption = { averageRating: -1, totalReviews: -1 };
  } else if (sort === 'newest') {
    sortOption = { createdAt: -1 };
  } else {
    // Default to rating if no keyword
    sortOption = { averageRating: -1, totalReviews: -1 };
  }

  // Pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Execute query
  const services = await Service.find(query)
    .populate('category', 'name icon')
    .populate('provider', 'name businessName avatar isVerified')
    .sort(sortOption)
    .skip(skip)
    .limit(limitNum);

  const totalResults = await Service.countDocuments(query);
  const totalPages = Math.ceil(totalResults / limitNum);

  res.json({
    services,
    currentPage: pageNum,
    totalPages,
    totalResults,
    resultsPerPage: services.length,
  });
});

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
const getServiceById = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id)
    .populate('category', 'name description icon')
    .populate('provider', 'name businessName email phone avatar bio portfolio isVerified availability location');

  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }

  res.json(service);
});

// @desc    Get distinct countries
// @route   GET /api/locations/countries
// @access  Public
const getCountries = asyncHandler(async (req, res) => {
  const countries = await Service.distinct('location.country', { isActive: true });
  res.json(countries.filter(Boolean).sort());
});

// @desc    Get cities by country
// @route   GET /api/locations/cities/:country
// @access  Public
const getCitiesByCountry = asyncHandler(async (req, res) => {
  const { country } = req.params;
  const cities = await Service.distinct('location.city', {
    'location.country': { $regex: new RegExp(`^${country}$`, 'i') },
    isActive: true,
  });
  res.json(cities.filter(Boolean).sort());
});

// @desc    Get areas by country and city
// @route   GET /api/locations/areas/:country/:city
// @access  Public
const getAreasByCity = asyncHandler(async (req, res) => {
  const { country, city } = req.params;
  const areas = await Service.distinct('location.area', {
    'location.country': { $regex: new RegExp(`^${country}$`, 'i') },
    'location.city': { $regex: new RegExp(`^${city}$`, 'i') },
    isActive: true,
  });
  res.json(areas.filter(Boolean).sort());
});

// @desc    Create a service
// @route   POST /api/services
// @access  Private (Provider only)
const createService = async (req, res) => {
  // TODO: Implement create service
};

// @desc    Update a service
// @route   PUT /api/services/:id
// @access  Private (Provider only)
const updateService = async (req, res) => {
  // TODO: Implement update service
};

// @desc    Delete a service
// @route   DELETE /api/services/:id
// @access  Private (Provider only)
const deleteService = async (req, res) => {
  // TODO: Implement delete service
};

export {
  getServices,
  getServiceById,
  getCountries,
  getCitiesByCountry,
  getAreasByCity,
  createService,
  updateService,
  deleteService,
};
