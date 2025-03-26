const { createForbiddenWordService } = require('../services');
const forbiddenWordService = createForbiddenWordService();

async function getForbiddenWords(req, res) {
  try {
    const { roomId } = req.params;
    const words = await forbiddenWordService.getForbiddenWords(roomId);
    res.json(words);
  } catch (error) {
    console.error('Error in getForbiddenWords:', error);
    res.status(500).json({ error: error.message });
  }
}

async function addForbiddenWord(req, res) {
  try {
    const { roomId } = req.params;
    const { word, action } = req.body;

    if (!word || !action) {
      throw new Error('Từ và hành động là bắt buộc');
    }

    if (!['censor', 'block'].includes(action)) {
      throw new Error('Hành động không hợp lệ. Chỉ chấp nhận: censor, block');
    }

    const newWord = await forbiddenWordService.addForbiddenWord(
      roomId,
      word,
      action,
      req.user.id
    );

    res.json(newWord);
  } catch (error) {
    console.error('Error in addForbiddenWord:', error);
    res.status(400).json({ error: error.message });
  }
}

async function removeForbiddenWord(req, res) {
  try {
    const { roomId, id } = req.params;
    await forbiddenWordService.removeForbiddenWord(roomId, id, req.user.id);
    res.json({ success: true, message: 'Đã xóa từ cấm' });
  } catch (error) {
    console.error('Error in removeForbiddenWord:', error);
    res.status(500).json({ error: error.message });
  }
}

async function checkMessage(req, res) {
  try {
    const { roomId } = req.params;
    const { content } = req.body;
    
    if (!content) {
      throw new Error('Nội dung tin nhắn là bắt buộc');
    }

    const result = await forbiddenWordService.checkMessage(roomId, content, req.user.role);
    res.json(result);
  } catch (error) {
    console.error('Error in checkMessage:', error);
    res.status(400).json({ error: error.message });
  }
}

module.exports = {
  getForbiddenWords,
  addForbiddenWord,
  removeForbiddenWord,
  checkMessage
};