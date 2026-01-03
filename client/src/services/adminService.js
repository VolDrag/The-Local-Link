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

  // Get all bookings
  getAllBookings: async () => {
    const response = await api.get('/admin/bookings');
    return response.data;
  },

  // Get all categories
  getAllCategories: async () => {
    const response = await api.get('/admin/categories');
    return response.data;
  },

  // Create category
  createCategory: async (categoryData) => {
    const response = await api.post('/admin/categories', categoryData);
    return response.data;
  },

  // Update category
  updateCategory: async (id, categoryData) => {
    const response = await api.put(`/admin/categories/${id}`, categoryData);
    return response.data;
  },

  // Delete category
  deleteCategory: async (id) => {
    const response = await api.delete(`/admin/categories/${id}`);
    return response.data;
  },

  // Get all reports
  getAllReports: async (status = '') => {
    const url = status ? `/admin/reports?status=${status}` : '/admin/reports';
    const response = await api.get(url);
    return response.data;
  },

  // Get single report
  getReport: async (id) => {
    const response = await api.get(`/admin/reports/${id}`);
    return response.data;
  },

  // Update report (status and admin response)
  updateReport: async (id, updateData) => {
    const response = await api.put(`/admin/reports/${id}`, updateData);
    return response.data;
  },

  // Delete report
  deleteReport: async (id) => {
    const response = await api.delete(`/admin/reports/${id}`);
    return response.data;
  },
};

export default adminService;
