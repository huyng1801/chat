const { User, ChatRoom, RoomMessage, DirectMessage, RoomMember, sequelize } = require('../models');
const { Op } = require('sequelize');

function createStatisticsService() {
  async function getOverallStats() {
    try {
      const [
        userCount,
        activeUserCount,
        roomCount,
        roomMessageCount,
        directMessageCount,
        onlineUsers
      ] = await Promise.all([
        User.count({
          where: { role: { [Op.ne]: 'system' } }
        }),
        User.count({ 
          where: { 
            is_active: true,
            role: { [Op.ne]: 'system' }
          } 
        }),
        ChatRoom.count(),
        RoomMessage.count({
          include: [{
            model: User,
            as: 'sender',
            where: { role: { [Op.ne]: 'system' } },
            required: true
          }]
        }),
        DirectMessage.count({
          include: [{
            model: User,
            as: 'sender',
            where: { role: { [Op.ne]: 'system' } },
            required: true
          }]
        }),
        User.count({
          where: { 
            status: 'online',
            role: { [Op.ne]: 'system' }
          },
          required: true
        })
      ]);

      return {
        users: userCount || 0,
        activeUsers: activeUserCount || 0,
        onlineUsers: onlineUsers || 0,
        totalRooms: roomCount || 0,
        totalMessages: (roomMessageCount || 0) + (directMessageCount || 0),
        roomMessages: roomMessageCount || 0,
        directMessages: directMessageCount || 0
      };
    } catch (error) {
      console.error('Error getting overall stats:', error);
      throw error;
    }
  }

  async function getMessageStats(startDate, endDate) {
    try {
      // Get room messages between dates
      const roomMessages = await RoomMessage.findAll({
        attributes: [
          [sequelize.fn('DATE', sequelize.col('RoomMessage.created_at')), 'date'],
          [sequelize.fn('COUNT', '*'), 'count']
        ],
        include: [{
          model: User,
          as: 'sender',
          where: { role: { [Op.ne]: 'system' } },
          attributes: []
        }],
        where: {
          created_at: {
            [Op.between]: [startDate, endDate]
          }
        },
        group: [sequelize.fn('DATE', sequelize.col('RoomMessage.created_at'))],
        order: [[sequelize.fn('DATE', sequelize.col('RoomMessage.created_at')), 'ASC']]
      });

      // Get direct messages between dates
      const directMessages = await DirectMessage.findAll({
        attributes: [
          [sequelize.fn('DATE', sequelize.col('DirectMessage.created_at')), 'date'],
          [sequelize.fn('COUNT', '*'), 'count']
        ],
        include: [{
          model: User,
          as: 'sender',
          where: { role: { [Op.ne]: 'system' } },
          attributes: []
        }],
        where: {
          created_at: {
            [Op.between]: [startDate, endDate]
          }
        },
        group: [sequelize.fn('DATE', sequelize.col('DirectMessage.created_at'))],
        order: [[sequelize.fn('DATE', sequelize.col('DirectMessage.created_at')), 'ASC']]
      });

      // Combine and process the data
      const messageMap = new Map();
      const currentDate = new Date(startDate);
      const endDateTime = new Date(endDate);
      
      while (currentDate <= endDateTime) {
        const dateStr = currentDate.toISOString().split('T')[0];
        messageMap.set(dateStr, {
          date: dateStr,
          roomMessages: 0,
          directMessages: 0,
          totalMessages: 0
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Add room messages to map
      roomMessages.forEach(msg => {
        const date = msg.getDataValue('date');
        const count = parseInt(msg.getDataValue('count'));
        const data = messageMap.get(date);
        if (data) {
          data.roomMessages = count;
          data.totalMessages += count;
        }
      });

      // Add direct messages to map
      directMessages.forEach(msg => {
        const date = msg.getDataValue('date');
        const count = parseInt(msg.getDataValue('count'));
        const data = messageMap.get(date);
        if (data) {
          data.directMessages = count;
          data.totalMessages += count;
        }
      });

      return Array.from(messageMap.values());
    } catch (error) {
      console.error('Error getting message stats:', error);
      throw error;
    }
  }

  async function getUserStats() {
    try {
      const [roleDistribution, statusDistribution, topUsers] = await Promise.all([
        User.findAll({
          attributes: [
            'role',
            [sequelize.fn('COUNT', '*'), 'value']
          ],
          where: { role: { [Op.ne]: 'system' } },
          group: ['role']
        }),
        User.findAll({
          attributes: [
            'status',
            [sequelize.fn('COUNT', '*'), 'value']
          ],
          where: { role: { [Op.ne]: 'system' } },
          group: ['status']
        }),
        User.findAll({
          where: { role: { [Op.ne]: 'system' } },
          attributes: [
            'id',
            'username',
            'display_name',
            'avatar',
            'status',
            [
              sequelize.literal(
                '(SELECT COUNT(*) FROM room_messages WHERE sender_id = User.id)'
              ),
              'room_messages'
            ],
            [
              sequelize.literal(
                '(SELECT COUNT(*) FROM direct_messages WHERE sender_id = User.id)'
              ),
              'direct_messages'
            ]
          ],
          order: [
            [sequelize.literal('room_messages + direct_messages'), 'DESC']
          ],
          limit: 10
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
        topUsers: topUsers.map(u => ({
          id: u.id,
          username: u.display_name || u.username,
          avatar: u.avatar,
          status: u.status,
          roomMessages: parseInt(u.getDataValue('room_messages')) || 0,
          directMessages: parseInt(u.getDataValue('direct_messages')) || 0,
          totalMessages: (parseInt(u.getDataValue('room_messages')) || 0) + 
                        (parseInt(u.getDataValue('direct_messages')) || 0)
        }))
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }

  async function getRoomStats() {
    try {
      const rooms = await ChatRoom.findAll({
        attributes: [
          'id',
          'name',
          [
            sequelize.literal(`(
              SELECT COUNT(*) 
              FROM room_messages rm
              JOIN users u ON rm.sender_id = u.id
              WHERE rm.room_id = ChatRoom.id
              AND u.role != 'system'
            )`),
            'message_count'
          ],
          [
            sequelize.literal(`(
              SELECT COUNT(DISTINCT rm.sender_id)
              FROM room_messages rm
              JOIN users u ON rm.sender_id = u.id
              WHERE rm.room_id = ChatRoom.id
              AND u.role != 'system'
            )`),
            'active_users'
          ]
        ],
        include: [
          {
            model: RoomMember,
            as: 'RoomMembers',
            attributes: ['status'],
            required: false,
            include: [{
              model: User,
              where: { role: { [Op.ne]: 'system' } },
              attributes: []
            }]
          }
        ],
        group: ['ChatRoom.id', 'ChatRoom.name'],
        having: sequelize.literal('message_count > 0'),
        order: [[sequelize.literal('message_count'), 'DESC']],
        limit: 10
      });

      return {
        topRooms: rooms.map(room => ({
          id: room.id,
          name: room.name,
          messageCount: parseInt(room.getDataValue('message_count')) || 0,
          activeUsers: parseInt(room.getDataValue('active_users')) || 0,
          members: {
            total: room.RoomMembers?.length || 0,
            accepted: room.RoomMembers?.filter(m => m.status === 'accepted').length || 0,
            pending: room.RoomMembers?.filter(m => m.status === 'pending').length || 0,
            rejected: room.RoomMembers?.filter(m => m.status === 'rejected').length || 0
          }
        }))
      };
    } catch (error) {
      console.error('Error getting room stats:', error);
      throw error;
    }
  }

  async function getRecentActivities(limit = 10) {
    try {
      const [roomActivities, directActivities] = await Promise.all([
        RoomMessage.findAll({
          attributes: ['id', 'content', 'created_at'],
          include: [
            {
              model: User,
              as: 'sender',
              where: { role: { [Op.ne]: 'system' } },
              attributes: ['username', 'display_name', 'avatar']
            },
            {
              model: ChatRoom,
              as: 'room',
              attributes: ['name']
            }
          ],
          order: [['created_at', 'DESC']],
          limit: Math.ceil(limit / 2)
        }),
        DirectMessage.findAll({
          attributes: ['id', 'content', 'created_at'],
          include: [
            {
              model: User,
              as: 'sender',
              where: { role: { [Op.ne]: 'system' } },
              attributes: ['username', 'display_name', 'avatar']
            },
            {
              model: User,
              as: 'receiver',
              where: { role: { [Op.ne]: 'system' } },
              attributes: ['username', 'display_name']
            }
          ],
          order: [['created_at', 'DESC']],
          limit: Math.ceil(limit / 2)
        })
      ]);

      const activities = [
        ...roomActivities.map(a => {
          if (!a || !a.sender || !a.room) return null;
          return {
            id: a.id,
            type: 'room',
            messageType: 'text', // Default to text since type isn't needed
            content: a.content,
            created_at: a.created_at,
            sender: {
              name: a.sender.display_name || a.sender.username,
              avatar: a.sender.avatar
            },
            target: {
              type: 'room',
              name: a.room.name || 'Phòng không xác định'
            }
          };
        }).filter(Boolean),
        ...directActivities.map(a => {
          if (!a || !a.sender || !a.receiver) return null;
          return {
            id: a.id,
            type: 'direct',
            messageType: 'text', // Default to text since type isn't needed
            content: a.content,
            created_at: a.created_at,
            sender: {
              name: a.sender.display_name || a.sender.username,
              avatar: a.sender.avatar
            },
            target: {
              type: 'user',
              name: a.receiver.display_name || a.receiver.username
            }
          };
        }).filter(Boolean)
      ]
      .sort((a, b) => b.created_at - a.created_at)
      .slice(0, limit);

      return activities;
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