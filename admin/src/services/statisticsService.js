import api from './api';

class StatisticsService {
  async getOverallStats() {
    return api.get('/statistics/overall');
  }

  async getMessageStats(startDate, endDate) {
    return api.get('/statistics/messages', {
      params: { startDate, endDate }
    });
  }

  async getUserStats() {
    return api.get('/statistics/users');
  }

  async getRoomStats() {
    return api.get('/statistics/rooms');
  }

  async getRecentActivities(limit = 10) {
    return api.get('/statistics/activities', {
      params: { limit }
    });
  }
}

export default new StatisticsService();