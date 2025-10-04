import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Создать заявку
export const createOrder = async (token, data) => {
  try {
    const response = await axios.post(`${API_URL}/orders`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Ошибка создания заявки');
  }
};

// Получить все заявки
export const getAllOrders = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/orders`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Ошибка получения заявок');
  }
};

// Получить заявки мастера
export const getMasterOrders = async (token, masterId) => {
  try {
    const response = await axios.get(`${API_URL}/orders/master/${masterId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Ошибка получения заявок');
  }
};

// Добавить обновление к заявке
export const addOrderUpdate = async (token, orderId, description) => {
  try {
    const response = await axios.post(
      `${API_URL}/orders/${orderId}/update`,
      { description },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Ошибка обновления');
  }
};

// Обновить статус/прогресс заявки
export const updateOrder = async (token, orderId, data) => {
  try {
    const response = await axios.patch(`${API_URL}/orders/${orderId}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Ошибка обновления');
  }
};

// Получить userId по email
export const getUserByEmail = async (token, email) => {
  try {
    const response = await axios.get(`${API_URL}/users/email/${email}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data._id;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Пользователь не найден');
  }
};