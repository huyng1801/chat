const { createAnnouncementService } = require('../services');
const announcementService = createAnnouncementService();

async function getAnnouncements(req, res) {
  try {
    const { roomId, isActive } = req.query;
    const filters = {
      roomId: roomId || null,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined
    };

    const announcements = await announcementService.getAnnouncements(filters);
    res.json(announcements);
  } catch (error) {
    console.error('Error in getAnnouncements:', error);
    res.status(500).json({ error: error.message });
  }
}

async function createAnnouncement(req, res) {
  try {
    const { roomId, content, schedule } = req.body;

    // Validate required fields
    if (!content || !schedule) {
      throw new Error('Nội dung và lịch thông báo là bắt buộc');
    }

    const announcement = await announcementService.createAnnouncement({
      roomId: roomId || null, // null means broadcast to all rooms
      content,
      schedule,
      userId: req.user.id
    });

    res.json(announcement);
  } catch (error) {
    console.error('Error in createAnnouncement:', error);
    res.status(400).json({ error: error.message });
  }
}

async function updateAnnouncement(req, res) {
  try {
    const { roomId, content, schedule, isActive } = req.body;

    // Validate required fields
    if (!content || !schedule) {
      throw new Error('Nội dung và lịch thông báo là bắt buộc');
    }

    const announcement = await announcementService.updateAnnouncement(req.params.id, {
      roomId: roomId || null,
      content,
      schedule,
      isActive
    });

    res.json(announcement);
  } catch (error) {
    console.error('Error in updateAnnouncement:', error);
    res.status(400).json({ error: error.message });
  }
}

async function deleteAnnouncement(req, res) {
  try {
    await announcementService.deleteAnnouncement(req.params.id);
    res.json({ success: true, message: 'Đã xóa thông báo' });
  } catch (error) {
    console.error('Error in deleteAnnouncement:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
};