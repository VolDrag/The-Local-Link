//####Rafi#####
// Service API Functions
// These functions send requests to the backend API
import api from './api';

const toServicePayload = (serviceData, files = []) => {
  if (!files?.length) return serviceData;
  const form = new FormData();
  form.append('title', serviceData.title);
  form.append('description', serviceData.description);
  form.append('category', serviceData.category?._id || serviceData.category);
  form.append('pricing', String(serviceData.pricing));
  form.append('pricingUnit', serviceData.pricingUnit || 'fixed');
  form.append('location', JSON.stringify(serviceData.location));
  form.append('imageUrls', JSON.stringify(serviceData.images || []));
  form.append('hasOffer', String(!!serviceData.hasOffer));
  if (serviceData.offerDescription) form.append('offerDescription', serviceData.offerDescription);
  if (serviceData.offerExpiry) form.append('offerExpiry', serviceData.offerExpiry);
  files.forEach((file) => form.append('photos', file));
  return form;
};

export const createService = async (serviceData, files = []) => {
  try {
    const response = await api.post('/services', toServicePayload(serviceData, files));
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateService = async (serviceId, serviceData, files = []) => {
  try {
    const response = await api.put(`/services/${serviceId}`, toServicePayload(serviceData, files));
    return response.data;
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
