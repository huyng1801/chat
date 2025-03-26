import api from './api';

class AnnouncementService {
  async getAnnouncements() {
    return api.get('/announcements');
  }

  async createAnnouncement(data) {
    return api.post('/announcements', data);
  }

  async updateAnnouncement(id, data) {
    return api.put(`/announcements/${id}`, data);
  }

  async deleteAnnouncement(id) {
    return api.delete(`/announcements/${id}`);
  }
}

export default new AnnouncementService();