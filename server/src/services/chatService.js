const { ChatRoom, User, Message, RoomMember, RoomBan, DirectMessage } = require('../models');
const { Op } = require('sequelize');

function createChatService() {
  async function createRoom(name, description, createdBy) {
    try {
      const room = await ChatRoom.create({
        name,
        description,
        created_by: createdBy
      });

      // Add creator as moderator
      await RoomMember.create({
        room_id: room.id,
        user_id: createdBy,
        status: 'accepted',
        role: 'moderator'
      });

      return getRoomById(room.id);
    } catch (error) {
      console.error('Error in createRoom:', error);
      throw error;
    }
  }

  async function getRooms({ 
    page = 1, 
    limit = 10, 
    search = '', 
    sortBy = 'created_at',
    sortOrder = 'desc'
  } = {}) {
    try {
      // Ensure numeric values
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 10;
      const offset = (pageNum - 1) * limitNum;

      // Build where clause
      const where = {};
      if (search) {
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ];
      }

      // Validate sort parameters
      const validSortColumns = ['created_at', 'updated_at', 'name'];
      const validSortOrders = ['asc', 'desc'];
      
      const finalSortBy = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
      const finalSortOrder = validSortOrders.includes(sortOrder.toLowerCase()) ? sortOrder : 'desc';

      const { count, rows } = await ChatRoom.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['username']
          },
          {
            model: User,
            as: 'members',
            attributes: ['id'],
            through: { where: { status: 'accepted' } }
          },
          {
            model: Message,
            as: 'messages',
            attributes: ['id', 'created_at'],
            separate: true,
            limit: 1,
            order: [['created_at', 'DESC']]
          }
        ],
        order: [[finalSortBy, finalSortOrder]],
        limit: limitNum,
        offset: offset,
        distinct: true
      });

      const rooms = rows.map(room => ({
        ...room.toJSON(),
        creator_name: room.creator?.username,
        member_count: room.members?.length || 0,
        message_count: room.messages?.length || 0,
        last_activity: room.messages?.[0]?.created_at
      }));
      return {
        rooms,
        pagination: {
          total: count,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(count / limitNum)
        }
      };
    } catch (error) {
      console.error('Error in getRooms:', error);
      throw error;
    }
  }

  async function getRoomById(id) {
    try {
      const room = await ChatRoom.findByPk(id, {
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['username']
          },
          {
            model: User,
            as: 'members',
            attributes: ['id'],
            through: { where: { status: 'accepted' } }
          },
          {
            model: Message,
            as: 'messages',
            attributes: ['id']
          }
        ]
      });

      if (!room) return null;

      return {
        ...room.toJSON(),
        creator_name: room.creator?.username,
        member_count: room.members?.length || 0,
        message_count: room.messages?.length || 0
      };
    } catch (error) {
      console.error('Error in getRoomById:', error);
      throw error;
    }
  }

  async function getRoomDetails(id) {
    try {
      const room = await ChatRoom.findByPk(id, {
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['username']
          },
          {
            model: User,
            as: 'members',
            attributes: ['id', 'username', 'display_name', 'avatar', 'status'],
            through: { 
              where: { status: 'accepted' },
              attributes: ['role', 'created_at']
            }
          }
        ]
      });

      if (!room) return null;

      // Get pending members
      const pendingMembers = await RoomMember.findAll({
        where: { room_id: id, status: 'pending' },
        include: [{
          model: User,
          attributes: ['id', 'username', 'display_name', 'avatar']
        }]
      });

      // Get banned users
      const bannedUsers = await RoomBan.findAll({
        where: { room_id: id },
        include: [
          {
            model: User,
            as: 'bannedUser',
            attributes: ['id', 'username', 'display_name', 'avatar']
          },
          {
            model: User,
            as: 'banner',
            attributes: ['username']
          }
        ]
      });

      // Get recent messages with sender information
      const recentMessages = await Message.findAll({
        where: { room_id: id },
        include: [{
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'display_name', 'avatar']
        }],
        order: [['created_at', 'DESC']],
        limit: 10
      });

      // Get message count
      const messageCount = await Message.count({
        where: { room_id: id }
      });

      // Transform the data
      const roomData = {
        ...room.toJSON(),
        creator_name: room.creator?.username,
        member_count: room.members?.length || 0,
        message_count: messageCount,
        members: room.members?.map(member => ({
          id: member.id,
          username: member.username,
          display_name: member.display_name,
          avatar: member.avatar,
          status: member.status,
          role: member.RoomMember.role,
          joined_at: member.RoomMember.created_at
        })) || [],
        pendingMembers: pendingMembers.map(m => ({
          id: m.User.id,
          username: m.User.username,
          display_name: m.User.display_name,
          avatar: m.User.avatar,
          requested_at: m.created_at
        })),
        bannedUsers: bannedUsers.map(b => ({
          id: b.bannedUser.id,
          username: b.bannedUser.username,
          display_name: b.bannedUser.display_name,
          avatar: b.bannedUser.avatar,
          banned_by_username: b.banner.username,
          banned_at: b.created_at,
          reason: b.reason
        })),
        recentMessages: recentMessages.map(m => ({
          id: m.id,
          content: m.content,
          type: m.type,
          created_at: m.created_at,
          sender_id: m.sender.id,
          sender_name: m.sender.display_name || m.sender.username,
          sender_avatar: m.sender.avatar
        }))
      };

      return roomData;
    } catch (error) {
      console.error('Error in getRoomDetails:', error);
      throw error;
    }
  }

  async function updateRoom(id, name, description) {
    try {
      await ChatRoom.update(
        { name, description },
        { where: { id } }
      );
      return getRoomById(id);
    } catch (error) {
      console.error('Error in updateRoom:', error);
      throw error;
    }
  }

  async function deleteRoom(id) {
    try {
      await ChatRoom.destroy({ where: { id } });
      return true;
    } catch (error) {
      console.error('Error in deleteRoom:', error);
      throw error;
    }
  }

  async function joinRoom(roomId, userId) {
    try {
      const [member, created] = await RoomMember.findOrCreate({
        where: { room_id: roomId, user_id: userId },
        defaults: {
          status: 'pending',
          role: 'member'
        }
      });

      if (!created && member.status === 'rejected') {
        await member.update({ status: 'pending' });
      }

      return member;
    } catch (error) {
      console.error('Error in joinRoom:', error);
      throw error;
    }
  }

  async function leaveRoom(roomId, userId) {
    try {
      const member = await RoomMember.findOne({
        where: { room_id: roomId, user_id: userId }
      });

      if (!member) {
        throw new Error('Không tìm thấy thành viên trong phòng');
      }

      if (member.role === 'moderator') {
        const moderatorCount = await RoomMember.count({
          where: { room_id: roomId, role: 'moderator' }
        });

        if (moderatorCount <= 1) {
          throw new Error('Không thể rời phòng vì bạn là người điều hành duy nhất');
        }
      }

      await member.destroy();
      return true;
    } catch (error) {
      console.error('Error in leaveRoom:', error);
      throw error;
    }
  }

  async function acceptMember(roomId, userId, moderatorId) {
    try {
      // Check if moderator has permission
      const moderator = await RoomMember.findOne({
        where: {
          room_id: roomId,
          user_id: moderatorId,
          role: 'moderator'
        }
      });

      if (!moderator) {
        throw new Error('Không có quyền chấp nhận thành viên');
      }

      const member = await RoomMember.findOne({
        where: { room_id: roomId, user_id: userId }
      });

      if (!member) {
        throw new Error('Không tìm thấy yêu cầu tham gia');
      }

      await member.update({ status: 'accepted' });
      return member;
    } catch (error) {
      console.error('Error in acceptMember:', error);
      throw error;
    }
  }

  async function rejectMember(roomId, userId, moderatorId) {
    try {
      // Check if moderator has permission
      const moderator = await RoomMember.findOne({
        where: {
          room_id: roomId,
          user_id: moderatorId,
          role: 'moderator'
        }
      });

      if (!moderator) {
        throw new Error('Không có quyền từ chối thành viên');
      }

      const member = await RoomMember.findOne({
        where: { room_id: roomId, user_id: userId }
      });

      if (!member) {
        throw new Error('Không tìm thấy yêu cầu tham gia');
      }

      await member.update({ status: 'rejected' });
      return member;
    } catch (error) {
      console.error('Error in rejectMember:', error);
      throw error;
    }
  }

  async function kickMember(roomId, userId, moderatorId) {
    try {
      // Check if moderator has permission
      const moderator = await RoomMember.findOne({
        where: {
          room_id: roomId,
          user_id: moderatorId,
          role: 'moderator'
        }
      });

      if (!moderator) {
        throw new Error('Không có quyền kick thành viên');
      }

      const member = await RoomMember.findOne({
        where: { room_id: roomId, user_id: userId }
      });

      if (!member) {
        throw new Error('Không tìm thấy thành viên');
      }

      if (member.role === 'moderator') {
        throw new Error('Không thể kick người điều hành khác');
      }

      await member.destroy();
      return true;
    } catch (error) {
      console.error('Error in kickMember:', error);
      throw error;
    }
  }

  async function getRoomMembers(roomId) {
    try {
      const members = await RoomMember.findAll({
        where: { room_id: roomId, status: 'accepted' },
        include: [{
          model: User,
          attributes: ['id', 'username', 'display_name', 'avatar', 'status']
        }]
      });

      return members.map(m => ({
        ...m.User.toJSON(),
        role: m.role,
        joined_at: m.created_at
      }));
    } catch (error) {
      console.error('Error in getRoomMembers:', error);
      throw error;
    }
  }

  async function getPendingMembers(roomId) {
    try {
      const members = await RoomMember.findAll({
        where: { room_id: roomId, status: 'pending' },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'display_name', 'avatar']
        }]
      });
  
      return members.map(m => ({
        ...m.user?.toJSON(),
        requested_at: m.createdAt
      }));
    } catch (error) {
      console.error('Error in getPendingMembers:', error);
      throw error;
    }
  }

  async function banUser(roomId, userId, moderatorId, duration, reason) {
    try {
   
      // Check if moderator has permission
      const moderator = await RoomMember.findOne({
        where: {
          room_id: roomId,
          user_id: moderatorId,
          role: 'moderator'
        }
      });

      if (!moderator) {
        throw new Error('Không có quyền cấm người dùng');
      }

      // Check if user is a moderator
      const member = await RoomMember.findOne({
        where: { room_id: roomId, user_id: userId }
      });

      if (member?.role === 'moderator') {
        throw new Error('Không thể cấm người điều hành');
      }

      // Calculate ban expiry time
      let expiresAt = new Date();
      const value = parseInt(duration);
      const unit = duration.slice(-1);
      
      switch (unit) {
        case 'h':
          expiresAt.setHours(expiresAt.getHours() + value);
          break;
        case 'd':
          expiresAt.setDate(expiresAt.getDate() + value);
          break;
        default:
          throw new Error('Thời gian cấm không hợp lệ');
      }

      // Add to ban list
      await RoomBan.create({
        room_id: roomId,
        user_id: userId,
        banned_by: moderatorId,
        reason,
        expires_at: expiresAt
      });

      return true;
    } catch (error) {
      console.error('Error in banUser:', error);
      throw error;
    }
  }

  async function unbanUser(roomId, userId, moderatorId) {
    try {
      // Check if moderator has permission
      const moderator = await RoomMember.findOne({
        where: {
          room_id: roomId,
          user_id: moderatorId,
          role: 'moderator'
        }
      });

      if (!moderator) {
        throw new Error('Không có quyền bỏ cấm người dùng');
      }

      const ban = await RoomBan.findOne({
        where: { room_id: roomId, user_id: userId }
      });

      if (!ban) {
        throw new Error('Không tìm thấy lệnh cấm');
      }

      await ban.destroy();
      return true;
    } catch (error) {
      console.error('Error in unbanUser:', error);
      throw error;
    }
  }

  async function getBannedUsers(roomId) {
    try {
      const bans = await RoomBan.findAll({
        where: { room_id: roomId },
        include: [
          {
            model: User,
            as: 'bannedUser',
            attributes: ['id', 'username', 'display_name', 'avatar']
          },
          {
            model: User,
            as: 'banner',
            attributes: ['username']
          }
        ]
      });

      return bans.map(b => ({
        ...b.bannedUser.toJSON(),
        banned_by_username: b.banner.username,
        banned_at: b.created_at,
        reason: b.reason
      }));
    } catch (error) {
      console.error('Error in getBannedUsers:', error);
      throw error;
    }
  }

  async function getMessagesByRoom(roomId, page = 1, limit = 20) {
    try {
      const { count, rows } = await Message.findAndCountAll({
        where: { room_id: roomId },
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
      console.error('Error in getMessagesByRoom:', error);
      throw error;
    }
  }

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

  async function createMessage(roomId, senderId, content, type = 'text') {
    try {
      // Check if sender is a member of the room
      const member = await RoomMember.findOne({
        where: {
          room_id: roomId,
          user_id: senderId,
          status: 'accepted'
        }
      });

      if (!member) {
        throw new Error('Không có quyền gửi tin nhắn trong phòng này');
      }

      const message = await Message.create({
        room_id: roomId,
        sender_id: senderId,
        content,
        type
      });

      return Message.findOne({
        where: { id: message.id },
        include: [{
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'display_name', 'avatar']
        }]
      });
    } catch (error) {
      console.error('Error in createMessage:', error);
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

      return DirectMessage.findOne({
        where: { id: message.id },
        include: [{
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'display_name', 'avatar']
        }]
      });
    } catch (error) {
      console.error('Error in createDirectMessage:', error);
      throw error;
    }
  }

  async function updateUserRole(roomId, userId, newRole) {
    try {
      // Define valid roles
      const validRoles = ['member', 'moderator'];
      if (!validRoles.includes(newRole)) {
        throw new Error('Invalid role specified. Allowed roles: member, moderator.');
      }
  
      // Check if the user is an active member of the room
      const roomMember = await RoomMember.findOne({
        where: { room_id: roomId, user_id: userId, status: 'accepted' }
      });
  
      if (!roomMember) {
        throw new Error('User is not a member of this room or has not been accepted.');
      }
  
      // Update the user's role
      await RoomMember.update({ role: newRole }, { where: { room_id: roomId, user_id: userId } });
  
      return { success: true, message: 'User role updated successfully' };
    } catch (error) {
      console.error('Error in updateUserRole:', error);
      throw error;
    }
  }
  async function  checkBanStatus(roomId, userId) {
    try {
      const ban = await RoomBan.findOne({
        where: {
          room_id: roomId,
          user_id: userId,
          expires_at: {
            [Op.gt]: new Date() // Check only active bans
          }
        }
      });

      return ban
        ? { isBanned: true, expires_at: ban.expires_at, reason: ban.reason }
        : { isBanned: false };
    } catch (error) {
      throw new Error('Không thể kiểm tra trạng thái cấm: ' + error.message);
    }
  }
  return {
    createRoom,
    getRooms,
    getRoomById,
    getRoomDetails,
    updateRoom,
    deleteRoom,
    joinRoom,
    leaveRoom,
    acceptMember,
    rejectMember,
    kickMember,
    getRoomMembers,
    getPendingMembers,
    banUser,
    unbanUser,
    getBannedUsers,
    getMessagesByRoom,
    getDirectMessages,
    createMessage,
    createDirectMessage,
    updateUserRole,
    checkBanStatus
  };
}

module.exports = createChatService;