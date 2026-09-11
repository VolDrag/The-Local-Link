import api from './api';
import { apiErrorMessage } from '../utils/helpers';

export const getUserProfile = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return error.response.data || { success: false, data: null };
    }
    throw new Error(apiErrorMessage(error, 'Failed to load profile'));
  }
};

export const createOrUpdateProfile = async (profileData) => {
  try {
    const formData = new FormData();
    Object.keys(profileData).forEach((key) => {
      if (profileData[key] !== null && profileData[key] !== undefined && profileData[key] !== '') {
        formData.append(key, profileData[key]);
      }
    });

    const response = await api.put('/users/profile', formData);
    return response.data;
  } catch (error) {
    throw new Error(apiErrorMessage(error, 'Failed to update profile'));
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(apiErrorMessage(error, 'Failed to delete account'));
  }
};
