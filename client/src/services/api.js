// ifty
import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Location data cache (30 minutes TTL)
const locationCache = {
  countries: { data: null, timestamp: null },
  cities: {},
  areas: {},
};

const CACHE_TTL = 30 * 60 * 1000; // 30 minutes in milliseconds

const isCacheValid = (timestamp) => {
  if (!timestamp) return false;
  return Date.now() - timestamp < CACHE_TTL;
};

// Service API functions
export const searchServices = async (params) => {
  const { data } = await api.get('/services', { params });
  return data;
};

export const getServiceById = async (id) => {
  const { data } = await api.get(`/services/${id}`);
  return data;
};

export const getServiceReviews = async (serviceId, page = 1, limit = 10) => {
  const { data } = await api.get(`/services/${serviceId}/reviews`, {
    params: { page, limit },
  });
  return data;
};

// Location API functions with caching
export const getCountries = async () => {
  // Check cache first
  if (
    isCacheValid(locationCache.countries.timestamp) &&
    locationCache.countries.data
  ) {
    return locationCache.countries.data;
  }

  // Fetch from API
  const { data } = await api.get('/services/locations/countries');
  
  // Update cache
  locationCache.countries = {
    data,
    timestamp: Date.now(),
  };

  return data;
};

export const getCitiesByCountry = async (country) => {
  const cacheKey = country;

  // Check cache first
  if (
    locationCache.cities[cacheKey] &&
    isCacheValid(locationCache.cities[cacheKey].timestamp)
  ) {
    return locationCache.cities[cacheKey].data;
  }

  // Fetch from API
  const { data } = await api.get(`/services/locations/cities/${encodeURIComponent(country)}`);
  
  // Update cache
  locationCache.cities[cacheKey] = {
    data,
    timestamp: Date.now(),
  };

  return data;
};

export const getAreasByCity = async (country, city) => {
  const cacheKey = `${country}-${city}`;

  // Check cache first
  if (
    locationCache.areas[cacheKey] &&
    isCacheValid(locationCache.areas[cacheKey].timestamp)
  ) {
    return locationCache.areas[cacheKey].data;
  }

  // Fetch from API
  const { data } = await api.get(
    `/services/locations/areas/${encodeURIComponent(country)}/${encodeURIComponent(city)}`
  );
  
  // Update cache
  locationCache.areas[cacheKey] = {
    data,
    timestamp: Date.now(),
  };

  return data;
};

export default api;
