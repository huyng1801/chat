import api from './api';

class UserService {
  async getUsers(params = {}) {
    return api.get('/users', { params });
  }

  async getUser(id) {
    return api.get(`/users/${id}`);
  }

  async createUser(userData) {
    return api.post('/users', userData);
  }

  async updateUser(id, userData) {
    return api.put(`/users/${id}`, userData);
  }

  async updateAvatar(id, avatarUrl) {
    return api.put(`/users/${id}/avatar`, { avatar: avatarUrl });
  }

  async resetPassword(id) {
    return api.put(`/users/${id}/reset-password`, { 
      newPassword: '123456' // Default password
    });
  }

  async deleteUser(id) {
    return api.delete(`/users/${id}`);
  }
}

export default new UserService();