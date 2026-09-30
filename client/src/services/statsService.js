import api from './api';

export const statsService = {
  getDashboardStats: async () => {
    const response = await api.get('/stats/dashboard');
    return response.data;
  },

  triggerReminder: async () => {
    const response = await api.post('/stats/trigger-reminder');
    return response.data;
  },
};

export default statsService;
