const { DirectMessage, User } = require('../models');
const { Op } = require('sequelize');

function createDirectMessageService() {
  async function getDirectMessages(userId1, userId2, page = 1, limit = 20) {
    try {
      const { count, rows } = await DirectMessage.findAndCountAll({
        where: {
          [Op.or]: [
            { sender_id: userId1, receiver_id: userId2 },
            { sender_id: userId2, receiver_id: userId1 }
          ]
        },
        include: [{
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'display_name', 'avatar']
        }],
        order: [['created_at', 'DESC']],
        limit,
        offset: (page - 1) * limit
      });

      const messages = rows.map(m => ({
        ...m.toJSON(),
        sender_name: m.sender.display_name || m.sender.username,
        sender_avatar: m.sender.avatar
      }));

      return {
        messages,
        pagination: {
          total: count,
          page,
          limit,
          hasMore: count > page * limit
        }
      };
    } catch (error) {
      console.error('Error in getDirectMessages:', error);
      throw error;
    }
  }

  async function createDirectMessage(senderId, receiverId, content, type = 'text') {
    try {
      const message = await DirectMessage.create({
        sender_id: senderId,
        receiver_id: receiverId,
        content,
        type
      });
  
      const fullMessage = await DirectMessage.findOne({
        where: { id: message.id },
        include: [{
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'display_name', 'avatar']
        }]
      });
  
      return { message: fullMessage }; 
    } catch (error) {
      console.error('Error in createDirectMessage:', error);
      throw error;
    }
  }
  
  

  return {
    getDirectMessages,
    createDirectMessage
  };
}

module.exports = createDirectMessageService;