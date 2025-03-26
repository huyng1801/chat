import api from './api';

class AuthService {
  async login(email, password) {
    return api.post('/auth/login', { email, password });
  }

  async logout() {
    return api.post('/auth/logout');
  }

  async getCurrentUser() {
    return api.get('/auth/me');
  }

  async updateProfile(profileData) {
    return api.put('/auth/profile', profileData);
  }

  async changePassword(currentPassword, newPassword) {
    return api.post('/auth/change-password', { currentPassword, newPassword });
  }

  async forgotPassword(email) {
    return api.post('/auth/forgot-password', { email });
  }
}

export default new AuthService();