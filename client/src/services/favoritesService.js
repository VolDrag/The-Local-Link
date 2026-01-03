// Feature 20: Favorites Service
// API calls for managing user's favorite services
// #ifty
import api from './api';

// Get all favorite services
export const getFavorites = async () => {
  try {
    console.log('Calling GET /favorites...');
    const response = await api.get('/favorites');
    console.log('GET /favorites response:', response);
    return response.data;
  } catch (error) {
    console.error('GET /favorites error:', error);
    console.error('Error response:', error.response);
    throw error.response?.data || error;
  }
};

// Toggle favorite status (add if not exists, remove if exists)
export const toggleFavorite = async (serviceId) => {
  try {
    console.log('Calling PUT /favorites/' + serviceId);
    const response = await api.put(`/favorites/${serviceId}`);
    console.log('PUT /favorites response:', response);
    return response.data;
  } catch (error) {
    console.error('PUT /favorites error:', error);
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
