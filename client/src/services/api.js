import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && token !== 'undefined' && token !== 'null') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config || {};
    const url = original.url || '';
    const isAuthRoute = url.includes('/auth/');

    if (error.response?.status === 401 && !original._retry && !isAuthRoute) {
      original._retry = true;
      try {
        const { data } = await api.post('/auth/refresh');
        if (data?.token) localStorage.setItem('token', data.token);
        if (data) localStorage.setItem('user', JSON.stringify(data));
        return api(original);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/admin/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

const locationCache = {
  countries: { data: null, timestamp: null },
  cities: {},
  areas: {},
};

const CACHE_TTL = 30 * 60 * 1000;

const isCacheValid = (timestamp) => {
  if (!timestamp) return false;
  return Date.now() - timestamp < CACHE_TTL;
};

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

export const getCountries = async () => {
  if (isCacheValid(locationCache.countries.timestamp) && locationCache.countries.data) {
    return locationCache.countries.data;
  }
  const { data } = await api.get('/services/locations/countries');
  locationCache.countries = { data, timestamp: Date.now() };
  return data;
};

export const getCitiesByCountry = async (country) => {
  const cacheKey = country;
  if (locationCache.cities[cacheKey] && isCacheValid(locationCache.cities[cacheKey].timestamp)) {
    return locationCache.cities[cacheKey].data;
  }
  const { data } = await api.get(`/services/locations/cities/${encodeURIComponent(country)}`);
  locationCache.cities[cacheKey] = { data, timestamp: Date.now() };
  return data;
};

export const getAreasByCity = async (country, city) => {
  const cacheKey = `${country}-${city}`;
  if (locationCache.areas[cacheKey] && isCacheValid(locationCache.areas[cacheKey].timestamp)) {
    return locationCache.areas[cacheKey].data;
  }
  const { data } = await api.get(
    `/services/locations/areas/${encodeURIComponent(country)}/${encodeURIComponent(city)}`
  );
  locationCache.areas[cacheKey] = { data, timestamp: Date.now() };
  return data;
};

export default api;
