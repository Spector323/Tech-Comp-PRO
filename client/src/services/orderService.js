import { api } from '@/services/api'
export const orderService = {
  // ✅ Получить заявки (автоматически по роли)
  async getMyOrders() {
    const response = await api.get('/orders');
    return response.data;
  },

  // ✅ Создать заявку
  async createOrder(orderData) {
    const response = await api.post('/orders', orderData);
    return response.data;
  },
  async getOrdersByRole() {
    const response = await api.get('/orders/my-orders');
    return response.data.orders;
  },
  // ✅ Обновить заявку
  async updateOrder(orderId, orderData) {
    const response = await api.put(`/orders/${orderId}`, orderData);
    return response.data;
  },

  // ✅ Удалить заявку
  async deleteOrder(orderId) {
    const response = await api.delete(`/orders/${orderId}`);
    return response.data;
  },

  // ✅ Менеджер: принять заявку
  async acceptOrder(orderId) {
    const response = await api.patch(`/orders/${orderId}/accept`);
    return response.data;
  },

  // ✅ Менеджер: отклонить заявку  
  async rejectOrder(orderId) {
    const response = await api.patch(`/orders/${orderId}/reject`);
    return response.data;
  },

  // ✅ Мастер: взять в работу
  async assignToMaster(orderId) {
    const response = await api.patch(`/orders/${orderId}/assign-master`);
    return response.data;
  },

  // ✅ Мастер: установить цену
  async setPrice(orderId, price) {
    const response = await api.patch(`/orders/${orderId}/set-price`, { price });
    return response.data;
  }
};