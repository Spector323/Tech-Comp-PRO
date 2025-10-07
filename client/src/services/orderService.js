import { api } from '@/services/api'

export const orderService = {
  async createOrder(orderData) {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  async getMyOrders() {
    const response = await api.get('/orders');
    return response.data;
  },

  async getAllOrders() {
    const response = await api.get('/orders');
    return response.data;
  },

  async deleteOrder(orderId) {
    const response = await api.delete(`/orders/${orderId}`);
    return response.data;
  },
  
  async updateOrderStatus(orderId, status) {
    const response = await api.patch(`/orders/${orderId}/status`, { status });
    return response.data;
  }
};