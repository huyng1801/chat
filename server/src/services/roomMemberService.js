const { RoomMember, User } = require('../models');

function createRoomMemberService() {
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
          as: 'User',
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

  async function updateUserRole(roomId, userId, newRole) {
    try {
      const validRoles = ['member', 'moderator'];
      if (!validRoles.includes(newRole)) {
        throw new Error('Invalid role specified. Allowed roles: member, moderator.');
      }
  
      const roomMember = await RoomMember.findOne({
        where: { room_id: roomId, user_id: userId, status: 'accepted' }
      });
  
      if (!roomMember) {
        throw new Error('User is not a member of this room or has not been accepted.');
      }
  
      await RoomMember.update(
        { role: newRole }, 
        { where: { room_id: roomId, user_id: userId } }
      );
  
      return { success: true, message: 'User role updated successfully' };
    } catch (error) {
      console.error('Error in updateUserRole:', error);
      throw error;
    }
  }

  return {
    joinRoom,
    leaveRoom,
    acceptMember,
    rejectMember,
    kickMember,
    getRoomMembers,
    getPendingMembers,
    updateUserRole
  };
}

module.exports = createRoomMemberService;