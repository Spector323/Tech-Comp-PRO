import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const register = async (data) => {
  const response = await axios.post(`${API_URL}/auth/register`, data);
  return response.data;
};

export const login = async (data) => {
  const response = await axios.post(`${API_URL}/auth/login`, data);
  return response.data;
};

export const updateProfile = async (token, data) => {
  const response = await axios.patch(`${API_URL}/profile/me`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const uploadAvatar = async (token, formData) => {
  const response = await axios.post(`${API_URL}/profile/avatar`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const changePassword = async (token, data) => {
  const response = await axios.post(`${API_URL}/auth/change-password`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getUserOrders = async (token, userId) => {
  const response = await axios.get(`${API_URL}/orders/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};