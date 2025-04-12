const { AutoReply, User, ChatRoom } = require('../models');
const { Op } = require('sequelize');

function createAutoReplyService() {
  async function getAutoReplies(filters = {}) {
    try {
      const where = {};
      console.log(filters);
      if (filters.roomId !== null) where.room_id = filters.roomId;
      if (typeof filters.isActive === 'boolean') where.is_active = filters.isActive;

      return await AutoReply.findAll({
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
        order: [
          ['priority', 'DESC'],
          ['created_at', 'DESC']
        ]
      });
    } catch (error) {
      console.error('Error getting auto replies:', error);
      throw error;
    }
  }

  async function createAutoReply(data) {
    try {
      const reply = await AutoReply.create({
        room_id: data.roomId,
        keyword: data.keyword,
        response: data.response,
        match_mode: data.matchMode || 'contains',
        priority: data.priority || 0,
        created_by: data.createdBy
      });

      return reply;
    } catch (error) {
      console.error('Error creating auto reply:', error);
      throw error;
    }
  }

  async function updateAutoReply(id, data) {
    try {
      const reply = await AutoReply.findByPk(id);
      
      if (!reply) {
        throw new Error('Không tìm thấy phản hồi tự động');
      }

      await reply.update({
        room_id: data.roomId,
        keyword: data.keyword,
        response: data.response,
        match_mode: data.matchMode,
        priority: data.priority,
        is_active: data.isActive
      });

      return reply;
    } catch (error) {
      console.error('Error updating auto reply:', error);
      throw error;
    }
  }

  async function deleteAutoReply(id) {
    try {
      const result = await AutoReply.destroy({ where: { id } });
      
      if (result === 0) {
        throw new Error('Không tìm thấy phản hồi tự động');
      }

      return true;
    } catch (error) {
      console.error('Error deleting auto reply:', error);
      throw error;
    }
  }

  async function checkMessage(roomId, content) {
    try {
      // Get all active auto-replies for this room and global auto-replies
      const replies = await AutoReply.findAll({
        where: {
          [Op.and]: [
            { is_active: true },
            {
              [Op.or]: [
                { room_id: roomId },
                { room_id: null } // Global auto-replies
              ]
            }
          ]
        },
        order: [['priority', 'DESC']]
      });

      // Normalize content for Vietnamese text
      const normalizedContent = content.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D');

      // Check each reply
      for (const reply of replies) {
        const normalizedKeyword = reply.keyword.toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/đ/g, 'd')
          .replace(/Đ/g, 'D');

        let isMatch = false;

        switch (reply.match_mode) {
          case 'exact':
            isMatch = normalizedContent === normalizedKeyword;
            break;
          case 'contains':
            isMatch = normalizedContent.includes(normalizedKeyword);
            break;
          case 'starts_with':
            isMatch = normalizedContent.startsWith(normalizedKeyword);
            break;
          case 'ends_with':
            isMatch = normalizedContent.endsWith(normalizedKeyword);
            break;
          case 'regex':
            try {
              const regex = new RegExp(normalizedKeyword, 'i');
              isMatch = regex.test(normalizedContent);
            } catch (error) {
              console.error('Invalid regex pattern:', error);
            }
            break;
        }

        if (isMatch) {
          return {
            matched: true,
            reply: reply.response
          };
        }
      }

      return {
        matched: false,
        reply: null
      };
    } catch (error) {
      console.error('Error checking message:', error);
      throw error;
    }
  }

  return {
    getAutoReplies,
    createAutoReply,
    updateAutoReply,
    deleteAutoReply,
    checkMessage
  };
}

module.exports = createAutoReplyService;