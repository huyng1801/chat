const { RoomBan, User, RoomMember } = require('../models');
const { Op } = require('sequelize');

function createRoomBanService() {
  async function banUser(roomId, userId, moderatorId, duration, reason) {
    try {
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

      const member = await RoomMember.findOne({
        where: { room_id: roomId, user_id: userId }
      });

      if (member?.role === 'moderator') {
        throw new Error('Không thể cấm người điều hành');
      }

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

  async function checkBanStatus(roomId, userId) {
    try {
      const ban = await RoomBan.findOne({
        where: {
          room_id: roomId,
          user_id: userId,
          expires_at: {
            [Op.gt]: new Date()
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
    banUser,
    unbanUser,
    getBannedUsers,
    checkBanStatus
  };
}

module.exports = createRoomBanService;