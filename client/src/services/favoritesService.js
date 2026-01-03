// Feature 20: Favorites Service
// API calls for managing user's favorite services
// #ifty
import api from './api';

// Get all favorite services
export const getFavorites = async () => {
  try {
    const response = await api.get('/favorites');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Toggle favorite status (add if not exists, remove if exists)
export const toggleFavorite = async (serviceId) => {
  try {
    const response = await api.put(`/favorites/${serviceId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Check if service is in favorites
export const checkFavorite = async (serviceId) => {
  try {
    const response = await api.get(`/favorites/check/${serviceId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Add service to favorites
export const addToFavorites = async (serviceId) => {
  try {
    const response = await api.post(`/favorites/${serviceId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Remove service from favorites
export const removeFromFavorites = async (serviceId) => {
  try {
    const response = await api.delete(`/favorites/${serviceId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
