// Review service - API calls for review operations
import api from './api';

export const reviewService = {
  // Create a review
  createReview: async (reviewData) => {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  },

  // Get reviews for a service
  getServiceReviews: async (serviceId, page = 1, limit = 10) => {
    const response = await api.get(`/reviews/service/${serviceId}`, {
      params: { page, limit }
    });
    return response.data;
  },

  // Respond to a review (provider only)
  respondToReview: async (reviewId, response) => {
    const res = await api.put(`/reviews/${reviewId}/response`, { response });
    return res.data;
  }
};

export default reviewService;