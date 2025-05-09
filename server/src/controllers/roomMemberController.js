const { createRoomMemberService } = require('../services');
const roomMemberService = createRoomMemberService();

async function joinRoom(req, res) {
  try {
    await roomMemberService.joinRoom(req.params.id, req.user.id);
    res.json({ success: true, message: 'Đã gửi yêu cầu tham gia phòng chat' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function leaveRoom(req, res) {
  try {
    await roomMemberService.leaveRoom(req.params.id, req.user.id);
    res.json({ success: true, message: 'Đã rời phòng chat' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function acceptMember(req, res) {
  try {
    await roomMemberService.acceptMember(req.params.id, req.params.userId, req.user.id);
    res.json({ success: true, message: 'Đã chấp nhận thành viên' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function rejectMember(req, res) {
  try {
    await roomMemberService.rejectMember(req.params.id, req.params.userId, req.user.id);
    res.json({ success: true, message: 'Đã từ chối thành viên' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function kickMember(req, res) {
  try {
    await roomMemberService.kickMember(req.params.id, req.params.userId, req.user.id);
    res.json({ success: true, message: 'Đã kick thành viên' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function getRoomMembers(req, res) {
  try {
    const members = await roomMemberService.getRoomMembers(req.params.id);

    res.json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getPendingMembers(req, res) {
  try {
    const members = await roomMemberService.getPendingMembers(req.params.id);
    console.log('members', members);
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateUserRole(req, res) {
  try {
    const { roomId, userId } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ error: 'Vai trò không được để trống' });
    }

    const result = await roomMemberService.updateUserRole(roomId, userId, role);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = {
  joinRoom,
  leaveRoom,
  acceptMember,
  rejectMember,
  kickMember,
  getRoomMembers,
  getPendingMembers,
  updateUserRole
};