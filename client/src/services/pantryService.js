import api from './api';

export const pantryService = {
  getItems: async (params = {}) => {
    const response = await api.get('/pantry', { params });
    return response.data;
  },

  getItemById: async (id) => {
    const response = await api.get(`/pantry/${id}`);
    return response.data;
  },

  addItem: async (itemData) => {
    const response = await api.post('/pantry', itemData);
    return response.data;
  },

  updateItem: async (id, itemData) => {
    const response = await api.put(`/pantry/${id}`, itemData);
    return response.data;
  },

  deleteItem: async (id) => {
    const response = await api.delete(`/pantry/${id}`);
    return response.data;
  },

  markAsUsed: async (id) => {
    const response = await api.post(`/pantry/${id}/use`);
    return response.data;
  },

  markAsWasted: async (id) => {
    const response = await api.post(`/pantry/${id}/waste`);
    return response.data;
  },
};

export default pantryService;
