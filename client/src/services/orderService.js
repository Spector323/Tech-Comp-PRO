import { api } from '@/services/api'
export const orderService = {
  async getMyOrders() {
    const response = await api.get('/orders');
    return response.data;
  },

  async assignToSpecificMaster(orderId, masterId) {
    const response = await api.patch(`/orders/${orderId}/assign-master`, { masterId });
    return response.data;
  },

  async getOrdersForManager() {
    const response = await api.get('/orders/manager');
    return response.data;
  },

  async createOrder(orderData) {
    const response = await api.post('/orders', orderData);
    return response.data;
  },
  async getOrdersByRole() {
    const response = await api.get('/orders/my-orders');
    return response.data.orders;
  },
  async updateOrder(orderId, orderData) {
    const response = await api.put(`/orders/${orderId}`, orderData);
    return response.data;
  },

  async deleteOrder(orderId) {
    const response = await api.delete(`/orders/${orderId}`);
    return response.data;
  },

  async acceptOrder(orderId) {
    const response = await api.patch(`/orders/${orderId}/accept`);
    return response.data;
  },

  async rejectOrder(orderId) {
    const response = await api.patch(`/orders/${orderId}/reject`);
    return response.data;
  },

  async assignToMaster(orderId) {
    const response = await api.patch(`/orders/${orderId}/assign-master`);
    return response.data;
  },

  async setPrice(orderId, price) {
    const response = await api.patch(`/orders/${orderId}/set-price`, { price });
    return response.data;
  }
};