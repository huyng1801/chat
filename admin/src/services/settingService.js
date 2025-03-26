import api from './api';

class SettingService {
  async getSettings() {
    return api.get('/settings');
  }

  async getSetting(key) {
    return api.get(`/settings/${key}`);
  }

  async updateSetting(key, value) {
    return api.put(`/settings/${key}`, { value });
  }

  async createSetting(key, value, description) {
    return api.post('/settings', { key, value, description });
  }

  async deleteSetting(key) {
    return api.delete(`/settings/${key}`);
  }
}

export default new SettingService();