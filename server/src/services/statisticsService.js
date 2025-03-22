const { User, ChatRoom, Message, RoomMember, sequelize } = require('../models');
const { Op } = require('sequelize');

function createStatisticsService() {
  async function getOverallStats() {
    try {
      const [
        userCount,
        activeUserCount,
        roomCount,
        messageCount
      ] = await Promise.all([
        User.count(),
        User.count({ where: { status: 'online' } }),
        ChatRoom.count(),
        Message.count()
      ]);

      return {
        users: userCount || 0,
        activeUsers: activeUserCount || 0,
        totalRooms: roomCount || 0,
        totalMessages: messageCount || 0
      };
    } catch (error) {
      console.error('Error getting overall stats:', error);
      throw error;
    }
  }

  async function getMessageStats(startDate, endDate) {
    try {
      const messages = await Message.findAll({
        attributes: [
          [sequelize.fn('date', sequelize.col('created_at')), 'date'],
          [sequelize.fn('count', '*'), 'count']
        ],
        where: {
          created_at: {
            [Op.between]: [startDate, endDate]
          }
        },
        group: [sequelize.fn('date', sequelize.col('created_at'))],
        order: [[sequelize.fn('date', sequelize.col('created_at')), 'ASC']]
      });

      // Fill in missing dates with zero counts
      const stats = [];
      const currentDate = new Date(startDate);
      const endDateTime = new Date(endDate);
      

      while (currentDate <= endDateTime) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const existingData = messages.find(m => m.getDataValue('date') === dateStr);

        stats.push({
          date: dateStr,
          count: existingData ? parseInt(existingData.getDataValue('count')) : 0
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      return stats;
    } catch (error) {
      console.error('Error getting message stats:', error);
      throw error;
    }
  }

  async function getUserStats() {
    try {
      const [roleDistribution, statusDistribution, topActiveUsers] = await Promise.all([
        User.findAll({
          attributes: [
            'role',
            [sequelize.fn('count', '*'), 'value']
          ],
          group: ['role']
        }),
        User.findAll({
          attributes: [
            'status',
            [sequelize.fn('count', '*'), 'value']
          ],
          group: ['status']
        }),
        Message.findAll({
          attributes: [
            'sender_id',
            [sequelize.fn('count', '*'), 'message_count']
          ],
          include: [{
            model: User,
            as: 'sender',
            attributes: ['username', 'display_name']
          }],
          group: ['sender_id', 'sender.id', 'sender.username', 'sender.display_name'],
          order: [[sequelize.fn('count', '*'), 'DESC']],
          limit: 5
        })
      ]);

      return {
        roleDistribution: roleDistribution.map(r => ({
          role: r.role,
          value: parseInt(r.getDataValue('value'))
        })),
        statusDistribution: statusDistribution.map(s => ({
          status: s.status,
          value: parseInt(s.getDataValue('value'))
        })),
        topActiveUsers: topActiveUsers.map(u => ({
          username: u.sender.display_name || u.sender.username,
          message_count: parseInt(u.getDataValue('message_count'))
        }))
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }

  async function getRoomStats() {
    try {
      const [topRooms, roomActivity] = await Promise.all([
        Message.findAll({
          attributes: [
            'room_id',
            [sequelize.fn('count', '*'), 'message_count']
          ],
          include: [{
            model: ChatRoom,
            as: 'room',
            attributes: ['name']
          }],
          group: ['room_id', 'room.id', 'room.name'],
          order: [[sequelize.fn('count', '*'), 'DESC']],
          limit: 5
        }),
        ChatRoom.findAll({
          attributes: [
            'id',
            'name',
            [sequelize.fn('count', sequelize.col('messages.id')), 'total_messages'],
            [sequelize.fn('count', sequelize.fn('DISTINCT', sequelize.col('messages.sender_id'))), 'unique_users']
          ],
          include: [{
            model: Message,
            as: 'messages',
            attributes: []
          }],
          group: ['ChatRoom.id', 'ChatRoom.name'],
          having: sequelize.literal('count(messages.id) > 0'),
          order: [[sequelize.fn('count', sequelize.col('messages.id')), 'DESC']]
        })
      ]);

      return {
        topRooms: topRooms.map(r => ({
          name: r.room.name,
          message_count: parseInt(r.getDataValue('message_count'))
        })),
        roomActivity: roomActivity.map(r => ({
          name: r.name,
          total_messages: parseInt(r.getDataValue('total_messages')),
          unique_users: parseInt(r.getDataValue('unique_users'))
        }))
      };
    } catch (error) {
      console.error('Error getting room stats:', error);
      throw error;
    }
  }

  async function getRecentActivities(limit = 10) {
    try {
      const activities = await Message.findAll({
        attributes: ['id', 'content', 'created_at', 'type'],
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['username', 'display_name']
          },
          {
            model: ChatRoom,
            as: 'room',
            attributes: ['name']
          }
        ],
        order: [['created_at', 'DESC']],
        limit
      });

      return activities.map(a => ({
        id: a.id,
        content: a.content,
        created_at: a.created_at,
        type: a.type,
        sender_name: a.sender?.display_name || a.sender?.username || 'Người dùng không xác định',
        room_name: a.room?.name || 'Phòng chat không xác định'
      }));
    } catch (error) {
      console.error('Error getting recent activities:', error);
      throw error;
    }
  }

  return {
    getOverallStats,
    getMessageStats,
    getUserStats,
    getRoomStats,
    getRecentActivities
  };
}

module.exports = createStatisticsService;