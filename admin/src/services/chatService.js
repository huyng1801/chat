import api from './api';

class ChatService {
  // Room operations
  async getRooms({ page = 1, limit = 10, search = '', sortBy = 'created_at', sortOrder = 'desc' } = {}) {
    return api.get('/chat/rooms', {
      params: { page, limit, search, sortBy, sortOrder }
    });
  }

  async getRoom(id) {
    return api.get(`/chat/rooms/${id}`);
  }

  async getRoomDetails(id) {
    return api.get(`/chat/rooms/${id}`);
  }

  async createRoom(roomData) {
    return api.post('/chat/rooms', roomData);
  }

  async updateRoom(id, roomData) {
    return api.put(`/chat/rooms/${id}`, roomData);
  }

  async deleteRoom(id) {
    return api.delete(`/chat/rooms/${id}`);
  }

  // Room membership operations
  async joinRoom(roomId) {
    return api.post(`/chat/rooms/${roomId}/join`);
  }

  async leaveRoom(roomId) {
    return api.post(`/chat/rooms/${roomId}/leave`);
  }

  async acceptMember(roomId, userId) {
    return api.post(`/chat/rooms/${roomId}/members/${userId}/accept`);
  }

  async rejectMember(roomId, userId) {
    return api.post(`/chat/rooms/${roomId}/members/${userId}/reject`);
  }

  async kickMember(roomId, userId) {
    return api.post(`/chat/rooms/${roomId}/members/${userId}/kick`);
  }

  async getRoomMembers(roomId) {
    return api.get(`/chat/rooms/${roomId}/members`);
  }

  async getPendingMembers(roomId) {
    return api.get(`/chat/rooms/${roomId}/members/pending`);
  }

  // Ban management
  async banUser(roomId, userId, { duration, reason }) {
    return api.post(`/chat/rooms/${roomId}/bans/${userId}`, {
      duration,
      reason
    });
  }

  async checkBanStatus(roomId, userId) {
    return api.get(`/chat/rooms/${roomId}/bans/${userId}/status`);
  }

  async unbanUser(roomId, userId) {
    return api.delete(`/chat/rooms/${roomId}/bans/${userId}`);
  }

  async getBannedUsers(roomId) {
    return api.get(`/chat/rooms/${roomId}/bans`);
  }

  // Message operations
  async getMessagesByRoom(roomId, page = 1, limit = 20) {
    return api.get(`/chat/rooms/${roomId}/messages`, {
      params: { page, limit }
    });
  }

  async getDirectMessages(userId, page = 1, limit = 20) {
    return api.get(`/chat/direct/${userId}/messages`, {
      params: { page, limit }
    });
  }

  async createMessage(roomId, senderId, content, type = 'text') {
    return api.post(`/chat/rooms/${roomId}/messages`, {
      content,
      type
    });
  }

  async createDirectMessage(userId, content, type = 'text') {
    return api.post(`/chat/direct/${userId}/messages`, {
      content,
      type
    });
  }

  // User operations for chat
  async getChatUsers({ status = '', excludeAdmin = true } = {}) {
    return api.get('/users/chat', {
      params: { status, excludeAdmin }
    });
  }
  
  async updateMemberRole(roomId, userId, newRole) {
    return api.put(`/chat/rooms/${roomId}/members/${userId}/role`, {
      role: newRole
    });
  }
  
  async checkBanStatus(roomId, userId) {
    return api.get(`/chat/rooms/${roomId}/bans/${userId}/status`);
  }
  
}

export default new ChatService();