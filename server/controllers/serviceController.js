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
const createService = asyncHandler(async (req, res) => {
  // Get data from form
  const { title, description, category, pricing, pricingUnit, location, images, hasOffer, offerDescription, offerExpiry } = req.body;

  console.log('req.user:', req.user); //Rafi  (debugging)
  console.log('req.body:', req.body); //Rafi (debugging)

  // Step 1: Check if user is a provider
  if (req.user.role !== 'provider') {
    res.status(403);
    throw new Error('Only service providers can create services');
  }

  // Step 2: Check if all required fields are provided
  if (!title || !description || !category || !pricing || !location) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Step 3: Check if location has all parts (city, area, country)
  if (!location.city || !location.area || !location.country) {
    res.status(400);
    throw new Error('Please provide complete location details (city, area, country)');
  }

  // Step 4: Save service to database
  const service = await Service.create({
    title,
    description,
    category,
    pricing,
    pricingUnit: pricingUnit || 'fixed',
    location,
    images: images || [],
    provider: req.user._id,
    hasOffer: hasOffer || false,
    offerDescription,
    offerExpiry,
  });

  // Step 5: Get the service with category and provider details
  const populatedService = await Service.findById(service._id)
    .populate('category', 'name icon')
    .populate('provider', 'username businessName email phone isVerified');

  // Step 6: Add service to provider's profile
  const Profile = (await import('../models/Profile.js')).default; //Profile e dekhabe
  await Profile.findOneAndUpdate(
    { user: req.user._id },
    { $addToSet: { services: service._id } },
    { upsert: false }
  );

  // Step 7: Send back the created service
  res.status(201).json({
    success: true,
    message: 'Service created successfully',
    service: populatedService,
  });
});


// @desc    Update a service
// @route   PUT /api/services/:id
// @access  Private (Provider only)
const updateService = asyncHandler(async (req, res) => {
  // Step 1: Find the service
  const service = await Service.findById(req.params.id);

  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }

  // Step 2: Check if the logged-in user owns this service
  if (service.provider.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You can only update your own services');
  }

  // Step 3: Update the service with new data
  const updatedService = await Service.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  )
    .populate('category', 'name icon')
    .populate('provider', 'username businessName email phone isVerified');

  // Step 4: Send back the updated service
  res.json({
    success: true,
    message: 'Service updated successfully',
    service: updatedService,
  });
});

// @desc    Delete a service
// @route   DELETE /api/services/:id
// @access  Private (Provider only)




//####################################Rafi###############################################
const deleteService = asyncHandler(async (req, res) => {
  // Step 1: Find the service
  const service = await Service.findById(req.params.id);

  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }

  // Step 2: Check if the logged-in user owns this service (or is admin)
  if (
    service.provider.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('You can only delete your own services');
  }

  // Step 3: Remove service from provider's profile
  const Profile = (await import('../models/Profile.js')).default;
  await Profile.findOneAndUpdate(
    { user: service.provider },
    { $pull: { services: service._id } }
  );

  // Step 4: Delete the service
  await service.deleteOne();

  // Step 5: Send success message
  res.json({
    success: true,
    message: 'Service deleted successfully',
  });
});

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
