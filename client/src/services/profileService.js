// Profile Service - API calls for user profile management
//Debashish
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get user profile by userId
export const getUserProfile = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Create or update user profile
export const createOrUpdateProfile = async (profileData) => {
  try {
    const token = localStorage.getItem('token');
    
    // Create FormData for file upload
    const formData = new FormData();
    
    // Append all fields to FormData
    Object.keys(profileData).forEach(key => {
      if (profileData[key] !== null && profileData[key] !== undefined) {
        formData.append(key, profileData[key]);
      }
    });

    const response = await axios.put(
      `${API_URL}/users/profile`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Delete user account
export const deleteUser = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`${API_URL}/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
