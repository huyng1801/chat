import api from './api';

class ForbiddenWordService {
  async getForbiddenWords(roomId) {
    return api.get(`/rooms/${roomId}/forbidden-words`);
  }

  async addForbiddenWord(roomId, word, action) {
    return api.post(`/rooms/${roomId}/forbidden-words`, { word, action });
  }

  async removeForbiddenWord(roomId, id) {
    return api.delete(`/rooms/${roomId}/forbidden-words/${id}`);
  }

  async checkMessage(roomId, content) {
    return api.post(`/rooms/${roomId}/forbidden-words/check`, { content });
  }
}

export default new ForbiddenWordService();