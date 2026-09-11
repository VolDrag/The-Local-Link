import api from './api';

export const bookingService = {
  createBooking: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  getMyBookings: async () => {
    const response = await api.get('/bookings/my-bookings');
    return response.data;
  },

  getProviderBookings: async () => {
    const response = await api.get('/bookings/provider-bookings');
    return response.data;
  },

  getBookingById: async (bookingId) => {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data;
  },

  updateBookingStatus: async (bookingId, status) => {
    const response = await api.patch(`/bookings/${bookingId}/status`, { status });
    return response.data;
  },

  cancelBooking: async (bookingId, reason) => {
    const response = await api.patch(`/bookings/${bookingId}/cancel`, { reason });
    return response.data;
  },

  flagNoShow: async (bookingId) => {
    const response = await api.post(`/bookings/${bookingId}/no-show`);
    return response.data;
  },

  proposeReschedule: async (bookingId, proposedTime) => {
    const response = await api.post(`/bookings/${bookingId}/reschedule`, { proposedTime });
    return response.data;
  },

  respondReschedule: async (bookingId, accept) => {
    const response = await api.post(`/bookings/${bookingId}/reschedule/respond`, { accept });
    return response.data;
  },

  markEnRoute: async (bookingId) => {
    const response = await api.post(`/bookings/${bookingId}/en-route`);
    return response.data;
  },

  getMessages: async (bookingId) => {
    const response = await api.get(`/bookings/${bookingId}/messages`);
    return response.data;
  },

  sendMessage: async (bookingId, body) => {
    const response = await api.post(`/bookings/${bookingId}/messages`, { body });
    return response.data;
  },

  getBookingHistory: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.serviceId) params.append('serviceId', filters.serviceId);
    const response = await api.get(`/bookings/history?${params.toString()}`);
    return response.data;
  },

  getProviderBookingHistory: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.serviceId) params.append('serviceId', filters.serviceId);
    const response = await api.get(`/bookings/provider-history?${params.toString()}`);
    return response.data;
  },
};

export default bookingService;
