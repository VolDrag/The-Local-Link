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
  getAllPayouts: async () => {
    const { data } = await api.get('/admin/payouts');
    return data;
  },
  reviewPayout: async (id, payload) => {
    const { data } = await api.put(`/admin/payouts/${id}`, payload);
    return data;
  },
  getPendingProviders: async () => {
    const { data } = await api.get('/admin/providers/pending');
    return data;
  },
  reviewIdentity: async (id, payload) => {
    const { data } = await api.put(`/admin/providers/${id}/verify`, payload);
    return data;
  },
  unsuspendProvider: async (id) => {
    const { data } = await api.put(`/admin/providers/${id}/unsuspend`);
    return data;
  },
  getDisputes: async (status = '') => {
    const url = status ? `/admin/disputes?status=${status}` : '/admin/disputes';
    const { data } = await api.get(url);
    return data;
  },
  resolveDispute: async (id, payload) => {
    const { data } = await api.put(`/admin/disputes/${id}`, payload);
    return data;
  },
  getAuditLogs: async () => {
    const { data } = await api.get('/admin/audit-logs');
    return data;
  },
};

export default adminService;
