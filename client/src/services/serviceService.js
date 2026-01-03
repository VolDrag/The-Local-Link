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


//Feature 16:
// Toggle service availability (online/offline)
export const toggleServiceAvailability = async (serviceId) => {
  try {
    // Send PATCH request to toggle availability
    const response = await api.patch(`/services/${serviceId}/availability`);
    return response.data; // Return the new status
  } catch (error) {
    throw error.response?.data || error;
  }
};//

//Feature 21:
// Update service pricing (hourly vs fixed rate)
export const updateServicePricing = async (serviceId, pricingData) => {
  try {
    // Send PATCH request to update pricing
    // pricingData should contain: { pricingType, hourlyRate, fixedRate }
    const response = await api.patch(`/services/${serviceId}/pricing`, pricingData);
    return response.data; // Return updated pricing information
  } catch (error) {
    // Pass the full error object with response data
    throw error;
  }
};//


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
