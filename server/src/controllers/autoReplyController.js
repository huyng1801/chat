const { createAutoReplyService } = require('../services');
const autoReplyService = createAutoReplyService();

async function getAutoReplies(req, res) {
  try {
    const { roomId, isActive } = req.query;
    const filters = {
      roomId: roomId || null,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined
    };

    const replies = await autoReplyService.getAutoReplies(filters);
    res.json(replies);
  } catch (error) {
    console.error('Error in getAutoReplies:', error);
    res.status(500).json({ error: error.message });
  }
}

async function createAutoReply(req, res) {
  try {
    const { roomId, keyword, response, matchMode, priority } = req.body;

    if (!keyword || !response) {
      throw new Error('Từ khóa và phản hồi là bắt buộc');
    }

    const reply = await autoReplyService.createAutoReply({
      roomId: roomId || null,
      keyword,
      response,
      matchMode,
      priority,
      createdBy: req.user.id
    });

    res.json(reply);
  } catch (error) {
    console.error('Error in createAutoReply:', error);
    res.status(400).json({ error: error.message });
  }
}

async function updateAutoReply(req, res) {
  try {
    const { roomId, keyword, response, matchMode, priority, isActive } = req.body;

    if (!keyword || !response) {
      throw new Error('Từ khóa và phản hồi là bắt buộc');
    }

    const reply = await autoReplyService.updateAutoReply(req.params.id, {
      roomId: roomId || null,
      keyword,
      response,
      matchMode,
      priority,
      isActive
    });

    res.json(reply);
  } catch (error) {
    console.error('Error in updateAutoReply:', error);
    res.status(400).json({ error: error.message });
  }
}

async function deleteAutoReply(req, res) {
  try {
    await autoReplyService.deleteAutoReply(req.params.id);
    res.json({ success: true, message: 'Đã xóa phản hồi tự động' });
  } catch (error) {
    console.error('Error in deleteAutoReply:', error);
    res.status(500).json({ error: error.message });
  }
}

async function checkMessage(req, res) {
  try {
    const { roomId, content } = req.body;

    if (!content) {
      throw new Error('Nội dung tin nhắn là bắt buộc');
    }

    const reply = await autoReplyService.checkMessage(roomId, content);
    res.json(reply);
  } catch (error) {
    console.error('Error in checkMessage:', error);
    res.status(400).json({ error: error.message });
  }
}

module.exports = {
  getAutoReplies,
  createAutoReply,
  updateAutoReply,
  deleteAutoReply,
  checkMessage
};