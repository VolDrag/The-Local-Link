// Admin service
import api from './api';

export const adminService = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },

  // Get all users
  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  // Get all services
  getAllServices: async () => {
    const response = await api.get('/admin/services');
    return response.data;
  },
};

export default adminService;
