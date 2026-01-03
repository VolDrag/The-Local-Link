// ifty
import asyncHandler from 'express-async-handler';
import Service from '../models/Service.js';
import User from '../models/User.js';
import Event from '../models/Event.js';

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
    // Feature 11: Location-based service discovery parameters
    lat,
    lng,
    radius, // in kilometers
  } = req.query;

  const query = { isActive: true };

  // Feature 11: Geospatial query for nearby services
  if (lat && lng && radius && radius !== 'all') {
    const radiusInMeters = parseFloat(radius) * 1000; // Convert km to meters
    query['location.coordinates'] = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)] // [longitude, latitude]
        },
        $maxDistance: radiusInMeters
      }
    };
  }

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

  // Get active events with discounts
  const now = new Date();
  const activeEvents = await Event.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now }
  });

  // Log active events for debugging
  console.log(`[Discount Debug] Found ${activeEvents.length} active event(s)`);
  activeEvents.forEach(event => {
    console.log(`  - ${event.title}: Category="${event.category}", Discount=${event.discount}`);
  });

  // Create a map of category name to discount (normalize with trim and lowercase)
  const discountMap = {};
  activeEvents.forEach(event => {
    if (event.discount && event.category) {
      const normalizedCategory = event.category.trim().toLowerCase();
      discountMap[normalizedCategory] = {
        discount: event.discount,
        eventTitle: event.title
      };
    }
  });

  // Add discount information to services
  const servicesWithDiscount = services.map(service => {
    const serviceObj = service.toObject();
    const categoryName = serviceObj.category?.name?.trim().toLowerCase() || '';
    const discountInfo = discountMap[categoryName];
    
    if (discountInfo && discountInfo.discount) {
      // Extract percentage from discount string (e.g., "20%" -> 20)
      const percentMatch = discountInfo.discount.match(/(\d+)%/);
      const discountPercent = percentMatch ? parseInt(percentMatch[1]) : 0;
      
      if (discountPercent > 0) {
        const originalPrice = serviceObj.pricing;
        const discountedPrice = originalPrice * (1 - discountPercent / 100);
        
        return {
          ...serviceObj,
          originalPrice: originalPrice,
          discountedPrice: parseFloat(discountedPrice.toFixed(2)),
          discountPercentage: discountPercent,
          hasDiscount: true
        };
      }
    }
    
    return {
      ...serviceObj,
      hasDiscount: false
    };
  });

  const totalResults = await Service.countDocuments(query);
  const totalPages = Math.ceil(totalResults / limitNum);

  res.json({
    services: servicesWithDiscount,
    currentPage: pageNum,
    totalPages,
    totalResults,
    resultsPerPage: servicesWithDiscount.length,
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

  // Get active events with discounts
  const now = new Date();
  const activeEvents = await Event.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now }
  });

  // Find discount for this service's category (normalize with trim and lowercase)
  const serviceObj = service.toObject();
  const categoryName = serviceObj.category?.name?.trim().toLowerCase() || '';
  const activeEvent = activeEvents.find(event => 
    event.category && event.category.trim().toLowerCase() === categoryName && event.discount
  );

  if (activeEvent) {
    // Extract percentage from discount string (e.g., "20%" -> 20)
    const percentMatch = activeEvent.discount.match(/(\d+)%/);
    const discountPercent = percentMatch ? parseInt(percentMatch[1]) : 0;
    
    if (discountPercent > 0) {
      const originalPrice = serviceObj.pricing;
      const discountedPrice = originalPrice * (1 - discountPercent / 100);
      
      serviceObj.originalPrice = originalPrice;
      serviceObj.discountedPrice = parseFloat(discountedPrice.toFixed(2));
      serviceObj.discountPercentage = discountPercent;
      serviceObj.hasDiscount = true;
      serviceObj.discountEvent = {
        title: activeEvent.title,
        description: activeEvent.description,
        endDate: activeEvent.endDate
      };
    } else {
      serviceObj.hasDiscount = false;
    }
  } else {
    serviceObj.hasDiscount = false;
  }

  res.json(serviceObj);
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

  // Feature 11: Prepare location data with coordinates if provided
  const locationData = {
    city: location.city,
    area: location.area,
    country: location.country,
  };

  // Add coordinates if provided (for map display)
  if (location.coordinates && location.coordinates.lat && location.coordinates.lng) {
    locationData.coordinates = {
      type: 'Point',
      coordinates: [parseFloat(location.coordinates.lng), parseFloat(location.coordinates.lat)] // [lng, lat] GeoJSON format
    };
  }

  // Step 4: Save service to database
  const service = await Service.create({
    title,
    description,
    category,
    pricing,
    pricingUnit: pricingUnit || 'fixed',
    location: locationData,
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

//Feature 15: Delete Service
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


//####################################Rafi###############################################
//Feature 16: Toggle Service Availability

// @desc    Toggle service availability status
// @route   PATCH /api/services/:id/availability
// @access  Private (Provider only)
const toggleAvailability = asyncHandler(async (req, res) => {
  // Step 1: Find the service by ID
  const service = await Service.findById(req.params.id);

  // Step 2: Check if service exists
  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }

  // Step 3: Make sure only the owner can toggle
  if (service.provider.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You can only update your own service availability');
  }

  // Step 4: Toggle between online and offline
  if (service.availabilityStatus === 'online') {
    service.availabilityStatus = 'offline';
  } else {
    service.availabilityStatus = 'online';
  }

  // Step 5: Save the updated service
  await service.save();

  // Step 6: Send back the new status
  res.json({
    success: true,
    message: `Service is now ${service.availabilityStatus}`,
    availabilityStatus: service.availabilityStatus,
  });
});

//####################################Rafi###############################################
//Feature 21: Dynamic Pricing (Hourly, Weekly, Monthly, Project, Fixed Rates)

// @desc    Update service pricing (hourly, weekly, monthly, project, or fixed rate)
// @route   PATCH /api/services/:id/pricing
// @access  Private (Provider only)
const updateServicePricing = asyncHandler(async (req, res) => {
  const { pricingType, hourlyRate, weeklyRate, monthlyRate, projectRate, fixedRate } = req.body;

  // Step 1: Find the service by ID
  const service = await Service.findById(req.params.id);

  // Step 2: Check if service exists
  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }

  // Step 3: Make sure only the owner can update pricing
  if (service.provider.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You can only update your own service pricing');
  }

  // Step 4: Validate pricing type (must be one of the allowed types)
  if (pricingType && !['hourly', 'weekly', 'monthly', 'project', 'fixed'].includes(pricingType)) {
    res.status(400);
    throw new Error('Invalid pricing type. Must be "hourly", "weekly", "monthly", "project", or "fixed"');
  }

  // Step 5: Update pricing fields
  if (pricingType) {
    service.pricingType = pricingType;
  }

  if (hourlyRate !== undefined) {
    if (hourlyRate < 0) {
      res.status(400);
      throw new Error('Hourly rate must be a positive number');
    }
    service.hourlyRate = hourlyRate;
  }

  if (weeklyRate !== undefined) {
    if (weeklyRate < 0) {
      res.status(400);
      throw new Error('Weekly rate must be a positive number');
    }
    service.weeklyRate = weeklyRate;
  }

  if (monthlyRate !== undefined) {
    if (monthlyRate < 0) {
      res.status(400);
      throw new Error('Monthly rate must be a positive number');
    }
    service.monthlyRate = monthlyRate;
  }

  if (projectRate !== undefined) {
    if (projectRate < 0) {
      res.status(400);
      throw new Error('Project rate must be a positive number');
    }
    service.projectRate = projectRate;
  }

  if (fixedRate !== undefined) {
    if (fixedRate < 0) {
      res.status(400);
      throw new Error('Fixed rate must be a positive number');
    }
    service.fixedRate = fixedRate;
  }

  // Step 6: Update the main pricing field based on pricing type (for backward compatibility)
  if (service.pricingType === 'hourly' && service.hourlyRate !== undefined) {
    service.pricing = service.hourlyRate;
    service.pricingUnit = 'hour';
  } else if (service.pricingType === 'weekly' && service.weeklyRate !== undefined) {
    service.pricing = service.weeklyRate;
    service.pricingUnit = 'day'; // Using 'day' for weekly (7 days)
  } else if (service.pricingType === 'monthly' && service.monthlyRate !== undefined) {
    service.pricing = service.monthlyRate;
    service.pricingUnit = 'project'; // Using 'project' for monthly
  } else if (service.pricingType === 'project' && service.projectRate !== undefined) {
    service.pricing = service.projectRate;
    service.pricingUnit = 'project';
  } else if (service.pricingType === 'fixed' && service.fixedRate !== undefined) {
    service.pricing = service.fixedRate;
    service.pricingUnit = 'fixed';
  }

  // Step 7: Save the updated service
  await service.save();

  // Step 8: Send back the updated pricing information
  res.json({
    success: true,
    message: 'Service pricing updated successfully',
    pricing: {
      pricingType: service.pricingType,
      hourlyRate: service.hourlyRate,
      weeklyRate: service.weeklyRate,
      monthlyRate: service.monthlyRate,
      projectRate: service.projectRate,
      fixedRate: service.fixedRate,
      currentPrice: service.pricing,
      currentUnit: service.pricingUnit,
    },
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
  toggleAvailability,
  updateServicePricing,
};
