const { RoomMessage, User, RoomMember, sequelize } = require('../models');
const { Op } = require('sequelize');
const createMessageCounterService = require('./messageCounterService');
const createForbiddenWordService = require('./forbiddenWordService');

function createRoomMessageService() {
  const messageCounterService = createMessageCounterService();
  const forbiddenWordService = createForbiddenWordService();

  async function getMessagesByRoom(roomId, userId, page = 1, limit = 20) {
    const t = await sequelize.transaction();
    
    try {
      // Get messages with optimized query
      const messages = await RoomMessage.findAll({
        where: { room_id: roomId },
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'username', 'display_name', 'avatar', 'role']
          }
        ],
        order: [['created_at', 'DESC']],
        limit,
        offset: (page - 1) * limit,
        transaction: t,
        lock: t.LOCK.SHARE
      });

      // Get total count efficiently
      const count = await RoomMessage.count({
        where: { room_id: roomId },
        transaction: t
      });

      // Mark messages as read in background
      messageCounterService.markAsRead('room', userId, roomId).catch(console.error);

      await t.commit();

      return {
        messages: messages.map(m => ({
          ...m.toJSON(),
          sender_name: m.sender.display_name || m.sender.username,
          sender_avatar: m.sender.avatar,
          sender_role: m.sender.role
        })),
        pagination: {
          total: count,
          page,
          limit,
          hasMore: count > page * limit
        }
      };
    } catch (error) {
      await t.rollback();
      console.error('Error in getMessagesByRoom:', error);
      throw error;
    }
  }

  async function getUnreadMessageCount(roomId, userId) {
    try {
      const counters = await messageCounterService.getUnreadCounts('room', userId, [roomId]);
      return counters[roomId] || 0;
    } catch (error) {
      console.error('Error in getUnreadMessageCount:', error);
      throw error;
    }
  }

  async function createMessage(roomId, senderId, content, type = 'text') {
    const t = await sequelize.transaction();

    try {
      // Check if user is member of the room
      const member = await RoomMember.findOne({
        where: { 
          room_id: roomId,
          user_id: senderId,
          status: 'accepted'
        },
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (!member) {
        throw new Error('Không có quyền gửi tin nhắn trong phòng này');
      }

      // Get user role
      const user = await User.findByPk(senderId, { 
        attributes: ['role'],
        transaction: t 
      });
      
      // Check forbidden words
      const { isAllowed, content: modifiedContent } = await forbiddenWordService.checkMessage(
        roomId,
        content, 
        user.role
      );

      if (!isAllowed) {
        throw new Error('Tin nhắn chứa từ ngữ bị cấm');
      }

      // Create the message
      const message = await RoomMessage.create({
        room_id: roomId,
        sender_id: senderId,
        content: modifiedContent,
        type
      }, { 
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      // Get room members for counter updates
      const members = await RoomMember.findAll({
        where: { 
          room_id: roomId,
          status: 'accepted',
          user_id: { [Op.ne]: senderId }
        },
        attributes: ['user_id'],
        transaction: t
      });

      // // Update message counters for all room members
      // const recipientIds = members.map(m => m.user_id);
      // await messageCounterService.incrementMessageCount(
      //   'room',
      //   roomId,
      //   senderId,
      //   recipientIds
      // );

      // Get message with sender details
      const messageWithDetails = await RoomMessage.findOne({
        where: { id: message.id },
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'username', 'display_name', 'avatar', 'role']
          }
        ],
        transaction: t
      });

      await t.commit();
      return messageWithDetails;
    } catch (error) {
      await t.rollback();
      console.error('Error in createMessage:', error);
      throw error;
    }
  }

  return {
    getMessagesByRoom,
    createMessage,
    getUnreadMessageCount
  };
}

module.exports = createRoomMessageService;