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
};

export default bookingService;