const { createRoomMessageService, createRoomMemberService } = require('../services');
const roomMessageService = createRoomMessageService();
const roomMemberService = createRoomMemberService();

async function getRoomMessages(req, res) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const roomId = req.params.roomId;

    // // Check if user is a member of the room
    // const members = await roomMemberService.getRoomMembers(roomId);
    // const isMember = members.some(m => m.id === req.user.id);

    // if (!isMember) {
    //   throw new Error('Không có quyền xem tin nhắn trong phòng này');
    // }

    const messages = await roomMessageService.getMessagesByRoom(
      roomId,
      req.user.id,
      parseInt(page),
      parseInt(limit)
    );

    res.json(messages);
  } catch (error) {
    console.error('Error in getRoomMessages:', error);
    res.status(error.message.includes('quyền') ? 403 : 500).json({ 
      error: error.message 
    });
  }
}

async function createMessage(req, res) {
  try {
    const { content, type = 'text' } = req.body;
    const roomId = req.params.roomId;
    const userId = req.user.id;

    // Validate content
    if (!content || content.trim().length === 0) {
      throw new Error('Nội dung tin nhắn không được để trống');
    }

    // Validate message type
    const validTypes = ['text', 'image', 'file'];
    if (!validTypes.includes(type)) {
      throw new Error('Loại tin nhắn không hợp lệ');
    }

    // Check if user is a member of the room
    const members = await roomMemberService.getRoomMembers(roomId);
    const isMember = members.some(m => m.id === userId);

    if (!isMember) {
      throw new Error('Không có quyền gửi tin nhắn trong phòng này');
    }

    const message = await roomMessageService.createMessage(
      roomId,
      userId,
      content,
      type
    );

    // Transform message for response
    const messageResponse = {
      ...message.message.toJSON(),
      sender_name: message.message.sender.display_name || message.message.sender.username,
      sender_avatar: message.message.sender.avatar
    };

    res.json(messageResponse);
  } catch (error) {
    console.error('Error in createMessage:', error);
    res.status(error.message.includes('quyền') ? 403 : 400).json({ 
      error: error.message 
    });
  }
}

async function getUnreadMessageCount(req, res) {
  try {
    const roomId = req.params.roomId;
    const userId = req.user.id;

    // Check if user is a member of the room
    const members = await roomMemberService.getRoomMembers(roomId);
    const isMember = members.some(m => m.id === userId);

    // if (!isMember) {
    //   throw new Error('Không có quyền xem trạng thái tin nhắn trong phòng này');
    // }

    const count = await roomMessageService.getUnreadMessageCount(roomId, userId);

    res.json({ count });
  } catch (error) {
    console.error('Error in getUnreadMessageCount:', error);
    res.status(error.message.includes('quyền') ? 403 : 500).json({ 
      error: error.message 
    });
  }
}

module.exports = {
  getRoomMessages,
  createMessage,
  getUnreadMessageCount
};