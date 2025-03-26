const { Announcement, ChatRoom, RoomMessage, User } = require('../models');
const { Op } = require('sequelize');
const cron = require('node-cron');

function createAnnouncementService(io) {
  let scheduledJobs = new Map();

  async function createAnnouncement(data) {
    try {
      // Validate cron expression
      if (!cron.validate(data.schedule)) {
        throw new Error('Định dạng lịch không hợp lệ');
      }

      const announcement = await Announcement.create({
        room_id: data.roomId,
        content: data.content,
        schedule: data.schedule,
        created_by: data.userId
      });

      // Schedule the announcement
      scheduleAnnouncement(announcement);

      return announcement;
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw error;
    }
  }

  async function updateAnnouncement(id, data) {
    try {
      const announcement = await Announcement.findByPk(id);
      if (!announcement) {
        throw new Error('Không tìm thấy thông báo');
      }

      if (data.schedule && !cron.validate(data.schedule)) {
        throw new Error('Định dạng lịch không hợp lệ');
      }

      await announcement.update({
        room_id: data.roomId,
        content: data.content,
        schedule: data.schedule,
        is_active: data.isActive
      });

      // Reschedule if active and schedule changed
      if (announcement.is_active) {
        unscheduleAnnouncement(id);
        scheduleAnnouncement(announcement);
      }

      return announcement;
    } catch (error) {
      console.error('Error updating announcement:', error);
      throw error;
    }
  }

  async function deleteAnnouncement(id) {
    try {
      const announcement = await Announcement.findByPk(id);
      if (!announcement) {
        throw new Error('Không tìm thấy thông báo');
      }

      // Unschedule before deleting
      unscheduleAnnouncement(id);
      await announcement.destroy();

      return true;
    } catch (error) {
      console.error('Error deleting announcement:', error);
      throw error;
    }
  }

  async function getAnnouncements(filters = {}) {
    try {
      const where = {};
      if (filters.roomId) where.room_id = filters.roomId;
      if (typeof filters.isActive === 'boolean') where.is_active = filters.isActive;

      return await Announcement.findAll({
        where,
        include: [
          {
            model: ChatRoom,
            as: 'room',
            attributes: ['name']
          },
          {
            model: User,
            as: 'creator',
            attributes: ['username', 'display_name']
          }
        ],
        order: [['created_at', 'DESC']]
      });
    } catch (error) {
      console.error('Error getting announcements:', error);
      throw error;
    }
  }

  async function sendAnnouncementMessage(roomId, content, botUser) {
    try {
      // Create message in database
      const message = await RoomMessage.create({
        room_id: roomId,
        sender_id: botUser.id,
        content,
        type: 'text'
      });

      // Get message with sender details
      const messageWithSender = await RoomMessage.findOne({
        where: { id: message.id },
        include: [{
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'display_name', 'avatar']
        }]
      });

      // Prepare message data for socket
      const messageData = {
        ...messageWithSender.toJSON(),
        sender_name: 'System Bot',
        sender_avatar: botUser.avatar
      };

      // Emit to room
      if (io) {
        io.to(`room:${roomId}`).emit('receive_message', messageData);
      }

      return message;
    } catch (error) {
      console.error('Error sending announcement message:', error);
      throw error;
    }
  }

  function scheduleAnnouncement(announcement) {
    if (!announcement.is_active) return;

    const job = cron.schedule(announcement.schedule, async () => {
      try {
        // Get system bot user
        const botUser = await User.findOne({
          where: { username: 'system' }
        });

        if (!botUser) {
          console.error('System bot user not found');
          return;
        }

        if (announcement.room_id) {
          // Send to specific room
          await sendAnnouncementMessage(announcement.room_id, announcement.content, botUser);
        } else {
          // Broadcast to all rooms
          const rooms = await ChatRoom.findAll();
          for (const room of rooms) {
            await sendAnnouncementMessage(room.id, announcement.content, botUser);
          }
        }

        // Update last run time
        await announcement.update({ last_run: new Date() });
      } catch (error) {
        console.error('Error sending scheduled announcement:', error);
      }
    });

    scheduledJobs.set(announcement.id, job);
  }

  function unscheduleAnnouncement(id) {
    const job = scheduledJobs.get(id);
    if (job) {
      job.stop();
      scheduledJobs.delete(id);
    }
  }

  // Initialize all active announcements on service start
  async function initializeScheduledAnnouncements() {
    try {
      const activeAnnouncements = await Announcement.findAll({
        where: { is_active: true }
      });

      activeAnnouncements.forEach(announcement => {
        scheduleAnnouncement(announcement);
      });

      console.log(`Initialized ${activeAnnouncements.length} scheduled announcements`);
    } catch (error) {
      console.error('Error initializing announcements:', error);
    }
  }

  // Clean up on service shutdown
  function cleanup() {
    for (const job of scheduledJobs.values()) {
      job.stop();
    }
    scheduledJobs.clear();
  }

  return {
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    getAnnouncements,
    initializeScheduledAnnouncements,
    cleanup
  };
}

module.exports = createAnnouncementService;