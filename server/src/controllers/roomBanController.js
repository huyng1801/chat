const { createRoomBanService } = require('../services');
const roomBanService = createRoomBanService();

async function banUser(req, res) {
  try {
    const { roomId, userId } = req.params;
    const { duration, reason } = req.body;

    if (!duration) {
      return res.status(400).json({ error: 'Thời gian cấm là bắt buộc' });
    }

    await roomBanService.banUser(roomId, userId, req.user.id, duration, reason);
    res.json({ success: true, message: 'Đã cấm người dùng' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function unbanUser(req, res) {
  try {
    await roomBanService.unbanUser(req.params.id, req.params.userId, req.user.id);
    res.json({ success: true, message: 'Đã bỏ cấm người dùng' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function getBannedUsers(req, res) {
  try {
    const users = await roomBanService.getBannedUsers(req.params.id);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function checkBanStatus(req, res) {
  try {
    const { roomId, userId } = req.params;
    const banStatus = await roomBanService.checkBanStatus(roomId, userId);
    res.json(banStatus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  banUser,
  unbanUser,
  getBannedUsers,
  checkBanStatus
};