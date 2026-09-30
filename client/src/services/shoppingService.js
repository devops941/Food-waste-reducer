import api from './api';

export const shoppingService = {
  getItems: async () => {
    const response = await api.get('/shopping');
    return response.data;
  },

  addItem: async (itemData) => {
    const response = await api.post('/shopping', itemData);
    return response.data;
  },

  addBulk: async (items) => {
    const response = await api.post('/shopping/bulk', { items });
    return response.data;
  },

  toggleItem: async (id, isChecked) => {
    const response = await api.put(`/shopping/${id}`, { isChecked });
    return response.data;
  },

  deleteItem: async (id) => {
    const response = await api.delete(`/shopping/${id}`);
    return response.data;
  },

  clearChecked: async () => {
    const response = await api.delete('/shopping/clear/checked');
    return response.data;
  },
};

export default shoppingService;
