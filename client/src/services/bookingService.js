// Booking service
// API calls for booking operations
import api from './api';

export const bookingService = {
  // Create a new booking
  createBooking: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  // Get user's bookings
  getMyBookings: async () => {
    const response = await api.get('/bookings/my-bookings');
    return response.data;
  },

  // Get provider's bookings
  getProviderBookings: async () => {
    const response = await api.get('/bookings/provider-bookings');
    return response.data;
  },

  // Get single booking by ID
  getBookingById: async (bookingId) => {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data;
  },

  // Update booking status
  updateBookingStatus: async (bookingId, status) => {
    const response = await api.patch(`/bookings/${bookingId}/status`, { status });
    return response.data;
  },

  // Cancel booking
  cancelBooking: async (bookingId) => {
    const response = await api.patch(`/bookings/${bookingId}/cancel`);
    return response.data;
  },

  // Get booking history with filters - Feature 19 (Anupam)
  getBookingHistory: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.serviceId) params.append('serviceId', filters.serviceId);
    
    const response = await api.get(`/bookings/history?${params.toString()}`);
    return response.data;
  },

  // Get provider booking history with filters - Feature 19 (Anupam)
  getProviderBookingHistory: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.serviceId) params.append('serviceId', filters.serviceId);
    
    const response = await api.get(`/bookings/provider-history?${params.toString()}`);
    return response.data;
  }
};

export default bookingService;