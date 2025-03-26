import api from './api';

class ChatService {
  // Room operations
  async getRooms(params = {}) {
    return api.get('/rooms', { params });
  }

  async getRoom(id) {
    return api.get(`/rooms/${id}`);
  }

  async createRoom(roomData) {
    return api.post('/rooms', roomData);
  }

  async updateRoom(id, roomData) {
    return api.put(`/rooms/${id}`, roomData);
  }

  async deleteRoom(id) {
    return api.delete(`/rooms/${id}`);
  }

  // Room membership operations
  async joinRoom(roomId) {
    return api.post(`/rooms/${roomId}/join`);
  }

  async leaveRoom(roomId) {
    return api.post(`/rooms/${roomId}/leave`);
  }

  async acceptMember(roomId, userId) {
    return api.post(`/rooms/${roomId}/members/${userId}/accept`);
  }

  async rejectMember(roomId, userId) {
    return api.post(`/rooms/${roomId}/members/${userId}/reject`);
  }

  async kickMember(roomId, userId) {
    return api.post(`/rooms/${roomId}/members/${userId}/kick`);
  }

  async getRoomMembers(roomId) {
    return api.get(`/rooms/${roomId}/members`);
  }

  async getPendingMembers(roomId) {
    return api.get(`/rooms/${roomId}/members/pending`);
  }

  async updateMemberRole(roomId, userId, role) {
    return api.put(`/rooms/${roomId}/members/${userId}/role`, { role });
  }

  // Ban management
  async banUser(roomId, userId, banData) {
    return api.post(`/rooms/${roomId}/bans/${userId}`, banData);
  }

  async unbanUser(roomId, userId) {
    return api.delete(`/rooms/${roomId}/bans/${userId}`);
  }

  async getBannedUsers(roomId) {
    return api.get(`/rooms/${roomId}/bans`);
  }

  async checkBanStatus(roomId, userId) {
    return api.get(`/rooms/${roomId}/bans/${userId}/status`);
  }

  // Message operations
  async getMessagesByRoom(roomId, page = 1, limit = 20) {
    return api.get(`/rooms/${roomId}/messages`, {
      params: { page, limit }
    });
  }

  async createMessage(roomId, content, type = 'text') {
    return api.post(`/rooms/${roomId}/messages`, {
      content,
      type
    });
  }

  // Direct message operations
  async getDirectMessages(userId, page = 1, limit = 20) {
    return api.get(`/direct/${userId}/messages`, {
      params: { page, limit }
    });
  }

  async createDirectMessage(userId, content, type = 'text') {
    return api.post(`/direct/${userId}/messages`, {
      content,
      type
    });
  }
}

export default new ChatService();