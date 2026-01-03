// Report Service - API calls for reports
import api from './api';

// Create a new report for a service
export const createReport = async (reportData) => {
  try {
    const response = await api.post('/reports', reportData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to submit report';
  }
};

// Get current user's reports
export const getUserReports = async () => {
  try {
    const response = await api.get('/reports/my-reports');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch reports';
  }
};

// Get a single report by ID
export const getReportById = async (reportId) => {
  try {
    const response = await api.get(`/reports/${reportId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch report';
  }
};

export default {
  createReport,
  getUserReports,
  getReportById
};
