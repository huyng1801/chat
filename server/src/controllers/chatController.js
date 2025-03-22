const createChatService = require('../services/chatService');
const chatService = createChatService();

async function getRooms(req, res) {
  try {
    const { 
      page,
      limit,
      search,
      sortBy,
      sortOrder
    } = req.query;

    const result = await chatService.getRooms({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      search: search || '',
      sortBy: sortBy || 'created_at',
      sortOrder: sortOrder || 'desc'
    });

    res.json(result);
  } catch (error) {
    console.error('Error in getRooms:', error);
    res.status(500).json({ error: error.message });
  }
}

async function getRoom(req, res) {
  try {
    const room = await chatService.getRoomById(req.params.id);
    if (!room) {
      throw new Error('Phòng chat không tồn tại');
    }
    res.json(room);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

async function createRoom(req, res) {
  try {
    const { name, description } = req.body;
    const room = await chatService.createRoom(name, description, req.user.id);
    res.json(room);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function updateRoom(req, res) {
  try {
    const { name, description } = req.body;
    await chatService.updateRoom(req.params.id, name, description);
    const room = await chatService.getRoomById(req.params.id);
    res.json(room);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function deleteRoom(req, res) {
  try {
    await chatService.deleteRoom(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function joinRoom(req, res) {
  try {
    await chatService.joinRoom(req.params.id, req.user.id);
    res.json({ success: true, message: 'Đã gửi yêu cầu tham gia phòng chat' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function leaveRoom(req, res) {
  try {
    await chatService.leaveRoom(req.params.id, req.user.id);
    res.json({ success: true, message: 'Đã rời phòng chat' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function acceptMember(req, res) {
  try {
    await chatService.acceptMember(req.params.id, req.params.userId, req.user.id);
    res.json({ success: true, message: 'Đã chấp nhận thành viên' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function rejectMember(req, res) {
  try {
    await chatService.rejectMember(req.params.id, req.params.userId, req.user.id);
    res.json({ success: true, message: 'Đã từ chối thành viên' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function kickMember(req, res) {
  try {
    await chatService.kickMember(req.params.id, req.params.userId, req.user.id);
    res.json({ success: true, message: 'Đã kick thành viên' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function getRoomMembers(req, res) {
  try {
    const members = await chatService.getRoomMembers(req.params.id);
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getPendingMembers(req, res) {
  try {
    const members = await chatService.getPendingMembers(req.params.id);
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function banUser(req, res) {
  try {
    const { roomId, userId } = req.params;
    const { duration, reason } = req.body;

    if (!duration) {
      return res.status(400).json({ error: 'Thời gian cấm là bắt buộc' });
    }

    await chatService.banUser(roomId, userId, req.user.id, duration, reason);
    res.json({ success: true, message: 'Đã cấm người dùng' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function unbanUser(req, res) {
  try {
    await chatService.unbanUser(req.params.id, req.params.userId, req.user.id);
    res.json({ success: true, message: 'Đã bỏ cấm người dùng' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function getBannedUsers(req, res) {
  try {
    const users = await chatService.getBannedUsers(req.params.id);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getRoomMessages(req, res) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const messages = await chatService.getMessagesByRoom(
      req.params.roomId,
      parseInt(page),
      parseInt(limit)
    );
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getDirectMessages(req, res) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const messages = await chatService.getDirectMessages(
      req.user.id,
      req.params.userId,
      parseInt(page),
      parseInt(limit)
    );
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function createMessage(req, res) {
  try {
    const { content, type } = req.body;
    const message = await chatService.createMessage(
      req.params.roomId,
      req.user.id,
      content,
      type
    );
    res.json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function createDirectMessage(req, res) {
  try {
    const { content, type } = req.body;
    const message = await chatService.createDirectMessage(
      req.user.id,
      req.params.userId,
      content,
      type
    );
    res.json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function updateUserRole(req, res) {
  try {
    const { roomId, userId } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ error: 'Vai trò không được để trống' });
    }

    const result = await chatService.updateUserRole(roomId, userId, role);
    
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
async function checkBanStatus(req, res) {
  try {
    const { roomId, userId } = req.params;
    const banStatus = await chatService.checkBanStatus(roomId, userId);

    res.json(banStatus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
module.exports = {
  getRooms,
  getRoom,
  createRoom,
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
  getRoomMessages,
  getDirectMessages,
  createMessage,
  createDirectMessage,
  updateUserRole,
  checkBanStatus
};