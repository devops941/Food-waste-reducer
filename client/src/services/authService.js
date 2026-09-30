import api from './api';

export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  testWhatsApp: async (phone) => {
    const response = await api.post('/auth/test-whatsapp', { phone });
    return response.data;
  },

  testEmail: async (email) => {
    const response = await api.post('/auth/test-email', { email });
    return response.data;
  },
};

export default authService;
