import api from './api';

class AutoReplyService {
  async getAutoReplies(filters = {}) {
    return api.get('/auto-replies', { params: filters });
  }
  

  async createAutoReply(data) {
    return api.post('/auto-replies', data);
  }

  async updateAutoReply(id, data) {
    return api.put(`/auto-replies/${id}`, data);
  }

  async deleteAutoReply(id) {
    return api.delete(`/auto-replies/${id}`);
  }

  async checkMessage(roomId, content) {
    return api.post('/auto-replies/check', { roomId, content });
  }
}

export default new AutoReplyService();