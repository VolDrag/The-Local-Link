//####Rafi#####
// Service API Functions
// These functions send requests to the backend API
import api from './api';

// Create a new service
export const createService = async (serviceData) => {
  try {
    // Send POST request with service data
    const response = await api.post('/services', serviceData);
    return response.data; // Return created service
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update an existing service
export const updateService = async (serviceId, serviceData) => {
  try {
    // Send PUT request with updated data
    const response = await api.put(`/services/${serviceId}`, serviceData);
    return response.data; // Return updated service
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete a service
export const deleteService = async (serviceId) => {
  try {
    // Send DELETE request
    const response = await api.delete(`/services/${serviceId}`);
    return response.data; // Return success message
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get all categories
export const getCategories = async () => {
  try {
    // Get list of all categories
    const response = await api.get('/categories');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
